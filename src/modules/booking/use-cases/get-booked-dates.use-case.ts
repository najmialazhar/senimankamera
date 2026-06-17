import { BookingRepository } from "../repositories/booking.repository";

export class GetBookedDatesUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(): Promise<string[]> {
    const dates = await this.bookingRepository.getBookedDates();
    // Format to YYYY-MM-DD strings for client-side comparison
    return dates.map((date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });
  }
}
