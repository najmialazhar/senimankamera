import { CalendarRepository } from "../repositories/calendar.repository";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";

export class BlockDateUseCase {
  constructor(
    private calendarRepository: CalendarRepository,
    private bookingRepository: BookingRepository
  ) {}

  async execute(date: Date, reason: string, adminUser?: string) {
    const targetDate = new Date(date);
    targetDate.setHours(12, 0, 0, 0);

    // Cek apakah tanggal sudah dibooking oleh client
    const isBooked = await this.bookingRepository.isDateBooked(targetDate);
    if (isBooked) {
      throw new Error("Tanggal ini sudah dibooking. Tidak bisa diblokir.");
    }

    return this.calendarRepository.upsertSlot(
      targetDate,
      "ManualBlock",
      null,
      reason,
      adminUser || "Admin"
    );
  }
}
