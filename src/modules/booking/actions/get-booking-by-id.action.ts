"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { BookingDraftRepository } from "../repositories/booking-draft.repository";
import { ConfirmBookingFromDraftUseCase } from "../use-cases/confirm-booking-from-draft.use-case";

export async function getBookingByIdAction(id: string) {
  try {
    const repository = new BookingRepository();
    let booking = await repository.findBookingById(id);

    if (!booking) {
      // Check if it exists in BookingDraft
      const draftRepo = new BookingDraftRepository();
      const draft = await draftRepo.findDraftById(id);

      if (draft) {
        if (process.env.NODE_ENV === "development") {
          console.log(`[DEV ONLY] Simulating webhook: Confirming booking from draft for ID: ${id}`);
          const confirmUseCase = new ConfirmBookingFromDraftUseCase(draftRepo);
          const confirmedBooking = await confirmUseCase.execute(id);
          if (confirmedBooking) {
            booking = confirmedBooking;

            // Trigger Telegram notification simulation on local dev
            try {
              const { TelegramService } = require("@/src/infrastructure/telegram/telegram.service");
              const packageRepo = new (await import("@/src/modules/booking/repositories/package.repository")).PackageRepository();
              const pkg = await packageRepo.findByNameOrCategory(booking.packageType);

              const telegramService = new TelegramService();
              await telegramService.sendBookingNotification({
                fullName: booking.client.fullName,
                email: booking.client.email,
                phoneNumber: booking.client.phoneNumber || undefined,
                instagram: booking.client.instagram || undefined,
                categoryName: pkg?.category?.label || pkg?.category?.name || undefined,
                packageType: booking.packageType,
                bookingDate: booking.bookingDate,
                eventTime: booking.eventTime || undefined,
                eventName: booking.eventName || undefined,
                eventLocation: booking.eventLocation || undefined,
                notes: booking.notes || undefined,
                dpAmount: booking.dpAmount || undefined,
                totalAmount: booking.totalAmount || undefined,
              });
              console.log(`[DEV ONLY] Simulated Telegram notification sent for ID: ${id}`);
            } catch (teleErr: any) {
              console.error("[DEV ONLY] Failed to send simulated Telegram notification:", teleErr.message);
            }
          }
        } else {
          return {
            success: false,
            error: "Sedang memverifikasi pembayaran Anda. Halaman ini akan memuat ulang secara otomatis...",
            isPendingWebhook: true,
          };
        }
      }
    }

    if (!booking) {
      return {
        success: false,
        error: "Booking tidak ditemukan.",
      };
    }

    // Convert Prisma model to a plain JS object (sanitize dates, etc.)
    return {
      success: true,
      data: JSON.parse(JSON.stringify(booking)),
    };
  } catch (error: any) {
    console.error("getBookingByIdAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
