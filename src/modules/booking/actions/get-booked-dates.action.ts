"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { GetBookedDatesUseCase } from "../use-cases/get-booked-dates.use-case";

export async function getBookedDatesAction() {
  try {
    const repository = new BookingRepository();
    const useCase = new GetBookedDatesUseCase(repository);
    const dates = await useCase.execute();

    return {
      success: true,
      data: dates,
    };
  } catch (error: any) {
    console.error("getBookedDatesAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
      data: [],
    };
  }
}
