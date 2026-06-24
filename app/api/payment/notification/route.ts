import crypto from "crypto";
import { BookingDraftRepository } from "@/src/modules/booking/repositories/booking-draft.repository";
import { ConfirmBookingFromDraftUseCase } from "@/src/modules/booking/use-cases/confirm-booking-from-draft.use-case";
import { TelegramService } from "@/src/infrastructure/telegram/telegram.service";
import { prisma } from "@/src/infrastructure/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Verify signature key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signatureSource = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(signatureSource)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.warn("Unauthorized signature from Midtrans webhook:", signature_key);
      return Response.json({ success: false, error: "Invalid signature" }, { status: 401 });
    }

    console.log(`Processing Midtrans webhook for Order ID: ${order_id}, Status: ${transaction_status}`);

    const bookingDraftRepository = new BookingDraftRepository();

    const isPaid =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    const isCancelled =
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire";

    if (isPaid) {
      const confirmUseCase = new ConfirmBookingFromDraftUseCase(bookingDraftRepository);
      const booking = await confirmUseCase.execute(order_id);
      if (!booking) {
        console.warn(`Booking draft not found or already confirmed for Order ID: ${order_id}`);
        return Response.json({ success: true, message: "Draft not found or already confirmed" });
      }

      console.log(`DP payment recorded for Order ID: ${order_id}. Booking stays PENDING for admin review.`);

      // Get package category for Telegram message
      const packageRepo = new (await import("@/src/modules/booking/repositories/package.repository")).PackageRepository();
      const pkg = await packageRepo.findByNameOrCategory(booking.packageType);

      // Send Telegram notification to admin
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

      console.log(`Telegram notification sent for Order ID: ${order_id}`);

    } else if (isCancelled) {
      // Payment cancelled/expired/denied — delete booking draft from database to free the slot
      await bookingDraftRepository.deleteDraft(order_id).catch((err: any) => {
        console.log(`BookingDraft ${order_id} not found, already deleted, or error:`, err.message);
      });
      console.log(`BookingDraft deleted due to payment cancel/deny/expire for Order ID: ${order_id}`);
    } else if (transaction_status === "pending") {
      console.log(`Payment pending for Order ID: ${order_id}`);
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error processing Midtrans webhook:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
