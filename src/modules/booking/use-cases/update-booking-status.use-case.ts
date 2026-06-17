import { BookingRepository } from "../repositories/booking.repository";
import { CalendarRepository } from "@/src/modules/calendar/repositories/calendar.repository";
import { TelegramService } from "@/src/infrastructure/telegram/telegram.service";

export class UpdateBookingStatusUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private calendarRepository: CalendarRepository
  ) {}

  async execute(id: string, status: string) {
    const validStatuses = ["PendingApproval", "Approved", "Rejected", "Cancelled", "Completed"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status tidak valid: ${status}`);
    }

    const booking = await this.bookingRepository.findBookingById(id);
    if (!booking) {
      throw new Error(`Booking dengan ID ${id} tidak ditemukan.`);
    }

    // Update booking status
    const updatedBooking = await this.bookingRepository.updateBookingStatus(id, status);

    // Update or create CalendarSlot status based on booking status
    const startOfDay = new Date(booking.bookingDate);
    startOfDay.setHours(12, 0, 0, 0);

    const isLockingStatus = ["PendingApproval", "Approved"].includes(status);

    if (isLockingStatus) {
      // Upsert the slot
      await this.calendarRepository.upsertSlot(
        startOfDay,
        status,
        booking.id
      );
    } else {
      // For Rejected, Cancelled, Completed, we update the slot status.
      // Alternatively, we can update or delete it. Let's delete it so the date becomes 100% clean and available.
      // Wait, let's update it to the non-locking status, or delete it. Deleting is safer for releasing slot availability cleanly.
      // Let's delete it if cancelled/rejected, so it doesn't appear in calendar slots query at all.
      await this.calendarRepository.deleteSlotByBookingId(booking.id);
    }

    // Send Telegram Notification for Approval or Rejection
    if (status === "Approved" || status === "Rejected") {
      const telegramService = new TelegramService();
      await telegramService.sendBookingStatusNotification(
        booking.client.fullName,
        booking.eventName || booking.packageType,
        booking.bookingDate,
        status
      );
    }

    return updatedBooking;
  }
}
