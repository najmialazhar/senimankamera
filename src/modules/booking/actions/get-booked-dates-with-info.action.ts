"use server";

import { BookingRepository } from "../repositories/booking.repository";

export async function getBookedDatesWithInfoAction() {
  try {
    const repository = new BookingRepository();
    const bookings = await repository.getBookingsCalendarInfo();

    return {
      success: true,
      data: bookings,
    };
  } catch (error: any) {
    console.error("getBookedDatesWithInfoAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
      data: [],
    };
  }
}
