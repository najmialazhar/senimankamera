import { prisma } from "@/src/infrastructure/prisma/client";
import { BookingDraftRepository } from "../repositories/booking-draft.repository";

export class ConfirmBookingFromDraftUseCase {
  constructor(private bookingDraftRepository: BookingDraftRepository) {}

  async execute(orderId: string) {
    // 1. Find the draft
    const draft = await this.bookingDraftRepository.findDraftById(orderId);
    if (!draft) {
      console.warn(`Booking draft not found for orderId: ${orderId}`);
      return null;
    }

    // 2. Create or update client
    const client = await prisma.client.upsert({
      where: { email: draft.email },
      update: {
        fullName: draft.fullName,
        ...(draft.phoneNumber ? { phoneNumber: draft.phoneNumber } : {}),
        ...(draft.instagram ? { instagram: draft.instagram.replace(/^@+/, "") } : {}),
      },
      create: {
        fullName: draft.fullName,
        email: draft.email,
        phoneNumber: draft.phoneNumber,
        instagram: draft.instagram ? draft.instagram.replace(/^@+/, "") : null,
      },
    });

    const isTimeBased = draft.bookingType === "TIME_BASED";

    // Normalize date to noon to avoid timezone shift day changes
    const normalizedDate = new Date(draft.bookingDate);
    normalizedDate.setHours(12, 0, 0, 0);

    // 3. Create booking, calendar slot, payment transaction and delete draft in a transaction
    return prisma.$transaction(async (tx: any) => {
      // Double check booking doesn't exist already (idempotency)
      const existingBooking = await tx.booking.findUnique({
        where: { id: draft.id },
        include: { client: true }
      });
      if (existingBooking) {
        // Already confirmed, just return it
        return existingBooking;
      }

      // Create Booking
      const booking = await tx.booking.create({
        data: {
          id: draft.id,
          clientId: client.id,
          packageType: draft.packageType,
          bookingDate: draft.bookingDate,
          eventTime: draft.eventTime,
          eventName: draft.eventName,
          eventLocation: draft.eventLocation,
          notes: draft.notes,
          status: "PENDING",
          paymentStatus: "PAID",
          snapToken: draft.snapToken,
          snapUrl: draft.snapUrl,
          dpAmount: draft.dpAmount,
          totalAmount: draft.totalAmount,
          source: "website",
          sessionStartTime: draft.sessionStartTime,
          sessionEndTime: draft.sessionEndTime,
        },
        include: {
          client: true,
        },
      });

      // Handle CalendarSlot
      if (isTimeBased) {
        const existingSlot = await tx.calendarSlot.findFirst({
          where: {
            date: {
              gte: new Date(new Date(draft.bookingDate).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(draft.bookingDate).setHours(23, 59, 59, 999)),
            },
          },
        });
        if (!existingSlot) {
          await tx.calendarSlot.create({
            data: {
              date: normalizedDate,
              status: "TIME_BASED_ACTIVE",
              bookingId: null,
            },
          });
        }
      } else {
        await tx.calendarSlot.create({
          data: {
            date: normalizedDate,
            status: "PENDING",
            bookingId: booking.id,
          },
        });
      }

      // Create PaymentTransaction
      if (draft.dpAmount) {
        await tx.paymentTransaction.create({
          data: {
            bookingId: booking.id,
            type: "DP",
            amount: draft.dpAmount,
            uniqueKey: `${booking.id}-DP`,
          },
        });
      }

      // Delete the BookingDraft
      await tx.bookingDraft.deleteMany({
        where: { id: draft.id },
      });

      return booking;
    });
  }
}
