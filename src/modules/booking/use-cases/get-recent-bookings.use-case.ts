import { BookingRepository } from "../repositories/booking.repository";

export class GetRecentBookingsUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(limit: number = 10) {
    return this.bookingRepository.findRecentBookings(limit);
  }
}
