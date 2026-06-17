import { BookingRepository, CreateBookingInput } from "../repositories/booking.repository";
import { CreateBookingSchema, CreateBookingInputType } from "../schemas/create-booking.schema";

export class CreateBookingUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(input: CreateBookingInputType) {
    // Validate schema
    const parsed = CreateBookingSchema.parse(input);

    const data: CreateBookingInput = {
      fullName: parsed.fullName,
      email: parsed.email,
      phoneNumber: parsed.phoneNumber || undefined,
      packageType: parsed.packageType,
      bookingDate: new Date(parsed.bookingDate),
      notes: parsed.notes || undefined,
    };

    return this.bookingRepository.createBooking(data);
  }
}
