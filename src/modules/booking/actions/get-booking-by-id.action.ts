"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { BookingDraftRepository } from "../repositories/booking-draft.repository";
import { ConfirmBookingFromDraftUseCase } from "../use-cases/confirm-booking-from-draft.use-case";

const activeTelegramSentSet = new Set<string>();

export async function getBookingByIdAction(id: string) {
  try {
    const repository = new BookingRepository();
    let booking = await repository.findBookingById(id);

    // Jika booking belum ada di tabel utama, lakukan pengecekan draft
    if (!booking) {
      const draftRepo = new BookingDraftRepository();
      const draft = await draftRepo.findDraftById(id);

      if (draft) {
        if (process.env.NODE_ENV === "development") {
          console.log(`[DEV ONLY] Simulating webhook: Confirming booking from draft for ID: ${id}`);
          const confirmUseCase = new ConfirmBookingFromDraftUseCase(draftRepo);
          const confirmedBooking = await confirmUseCase.execute(id);
          if (confirmedBooking) {
            booking = confirmedBooking;
          }
        } else {
          return {
            success: false,
            isPendingWebhook: true,
            error: "Sedang memverifikasi pembayaran Anda. Halaman ini akan memuat ulang secara otomatis...",
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

    // Kirim notifikasi Telegram tepat saat booking beneran terkonfirmasi dan siap tampil di Halaman Sukses
    if (booking && !activeTelegramSentSet.has(booking.id)) {
      activeTelegramSentSet.add(booking.id);
      try {
        const { PackageRepository } = await import("../repositories/package.repository");
        const packageRepo = new PackageRepository();
        const pkg = await packageRepo.findByNameOrCategory(booking.packageType);
        const { TelegramService } = await import("@/src/infrastructure/telegram/telegram.service");
        const telegramService = new TelegramService();
        await telegramService.sendBookingNotification({
          id: booking.id,
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
        console.log(`Telegram notification sent for ID: ${booking.id}`);
      } catch (e) {
        console.error("Failed to send Telegram notification in active status check:", e);
      }
    }

    // Fetch package details to get the category label
    let categoryName = "";
    try {
      const { PackageRepository } = await import("../repositories/package.repository");
      const packageRepo = new PackageRepository();
      const pkg = await packageRepo.findByNameOrCategory(booking.packageType);
      categoryName = pkg?.category?.label || pkg?.category?.name || "";
    } catch (e) {
      console.error("Failed to fetch category name for booking success view:", e);
    }

    // Convert Prisma model to a plain JS object
    const bookingJson = JSON.parse(JSON.stringify(booking));
    bookingJson.categoryName = categoryName;

    return {
      success: true,
      data: bookingJson,
    };
  } catch (error: any) {
    console.error("getBookingByIdAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
