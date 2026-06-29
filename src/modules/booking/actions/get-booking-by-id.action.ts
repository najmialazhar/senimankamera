"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { BookingDraftRepository } from "../repositories/booking-draft.repository";

// Set memori untuk mencegah pengiriman notifikasi Telegram ganda untuk booking ID yang sama
const telegramSentCache = new Set<string>();

export async function getBookingByIdAction(id: string) {
  try {
    const repository = new BookingRepository();
    let booking = await repository.findBookingById(id);

    // Jika booking belum ada di tabel utama tetapi ada di tabel Draft (pengguna baru kembali dari portal pembayaran DOKU)
    if (!booking) {
      const draftRepo = new BookingDraftRepository();
      const draft = await draftRepo.findDraftById(id);

      if (draft) {
        const { ConfirmBookingFromDraftUseCase } = await import("../use-cases/confirm-booking-from-draft.use-case");
        const confirmUseCase = new ConfirmBookingFromDraftUseCase(draftRepo);
        booking = await confirmUseCase.execute(id);
      }
    }

    if (!booking) {
      return {
        success: false,
        isPendingPayment: false,
        error: "Booking tidak ditemukan.",
      };
    }

    // Kirim notifikasi Telegram tepat saat booking terkonfirmasi dan siap tampil di Halaman Sukses
    if (booking && !telegramSentCache.has(booking.id)) {
      telegramSentCache.add(booking.id);
      try {
        const { PackageRepository } = await import("../repositories/package.repository");
        const packageRepo = new PackageRepository();
        const pkg = await packageRepo.findByNameOrCategory(booking.packageType);
        const { TelegramService } = await import("@/src/infrastructure/telegram/telegram.service");
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
      } catch (e) {
        console.error("Failed to send Telegram notification in booking success action:", e);
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
      isPendingPayment: false,
      data: bookingJson,
    };
  } catch (error: any) {
    console.error("getBookingByIdAction error:", error);
    return {
      success: false,
      isPendingPayment: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
