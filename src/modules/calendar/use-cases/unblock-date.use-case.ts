import { CalendarRepository } from "../repositories/calendar.repository";

export class UnblockDateUseCase {
  constructor(private calendarRepository: CalendarRepository) {}

  async execute(date: Date) {
    const targetDate = new Date(date);
    targetDate.setHours(12, 0, 0, 0);

    const slot = await this.calendarRepository.findSlotByDate(targetDate);
    if (!slot) {
      throw new Error("Tanggal tidak terblokir.");
    }

    if (slot.status !== "ManualBlock") {
      throw new Error("Tanggal ini terisi oleh booking aktif, gunakan fitur Cancel/Reject pada menu Booking.");
    }

    return this.calendarRepository.deleteSlotByDate(targetDate);
  }
}
