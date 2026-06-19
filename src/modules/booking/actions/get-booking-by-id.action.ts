"use server";

import { BookingRepository } from "../repositories/booking.repository";

export async function getBookingByIdAction(id: string) {
  try {
    const repository = new BookingRepository();
    const booking = await repository.findBookingById(id);

    if (!booking) {
      return {
        success: false,
        error: "Booking tidak ditemukan.",
      };
    }

    // Convert Prisma model to a plain JS object (sanitize dates, etc.)
    return {
      success: true,
      data: JSON.parse(JSON.stringify(booking)),
    };
  } catch (error: any) {
    console.error("getBookingByIdAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
