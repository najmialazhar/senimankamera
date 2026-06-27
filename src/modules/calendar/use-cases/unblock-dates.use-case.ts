import { CalendarRepository } from "../repositories/calendar.repository";

export class UnblockDatesUseCase {
  constructor(private calendarRepository: CalendarRepository) {}

  async execute(dates: Date[]) {
    if (!dates || dates.length === 0) {
      throw new Error("Pilih setidaknya satu tanggal untuk dibuka blokirnya.");
    }
    return this.calendarRepository.unblockDates(dates);
  }
}
