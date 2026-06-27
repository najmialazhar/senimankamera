import { CalendarRepository } from "../repositories/calendar.repository";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";

export class BlockDatesUseCase {
  constructor(
    private calendarRepository: CalendarRepository,
    private bookingRepository: BookingRepository
  ) {}

  async execute(dates: Date[], reason: string, adminUser?: string) {
    if (!dates || dates.length === 0) {
      throw new Error("Pilih setidaknya satu tanggal untuk diblokir.");
    }

    // Validasi semua tanggal terlebih dahulu sebelum melakukan database transaction
    for (const date of dates) {
      const targetDate = new Date(date);
      targetDate.setHours(12, 0, 0, 0);

      // Cek apakah tanggal sudah dibooking oleh client
      const isBooked = await this.bookingRepository.isDateBooked(targetDate);
      if (isBooked) {
        // Namun, jika sudah diblokir secara manual sebelumnya, tidak apa-apa ditimpa
        const existingSlot = await this.calendarRepository.findSlotByDate(targetDate);
        if (existingSlot && existingSlot.status !== "ManualBlock") {
          const dateStr = targetDate.toLocaleDateString("id-ID", { dateStyle: "long" });
          throw new Error(`Tanggal ${dateStr} sudah memiliki pesanan aktif. Tidak bisa diblokir.`);
        }
      }

      const existingSlot = await this.calendarRepository.findSlotByDate(targetDate);
      if (existingSlot?.status === "TIME_BASED_ACTIVE") {
        const dateStr = targetDate.toLocaleDateString("id-ID", { dateStyle: "long" });
        throw new Error(
          `Tanggal ${dateStr} memiliki sesi foto per jam yang masih aktif. Batalkan semua sesi terlebih dahulu sebelum memblokir.`
        );
      }
    }

    return this.calendarRepository.blockDates(dates, reason, adminUser || "Admin");
  }
}
