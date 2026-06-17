import { prisma } from "@/src/infrastructure/prisma/client";

export interface CreateBookingInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  packageType: string;
  bookingDate: Date;
  notes?: string;
}

export class BookingRepository {
  async createBooking(data: CreateBookingInput) {
    // Check if client exists, otherwise create
    const client = await prisma.client.upsert({
      where: { email: data.email },
      update: {
        fullName: data.fullName,
        ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
      },
      create: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      },
    });

    // Create the booking linked to the client
    return prisma.booking.create({
      data: {
        clientId: client.id,
        packageType: data.packageType,
        bookingDate: data.bookingDate,
        notes: data.notes,
        status: "Pending",
      },
    });
  }

  async findRecentBookings(limit: number = 10) {
    return prisma.booking.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: true,
      },
    });
  }
}
