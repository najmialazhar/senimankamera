"use server";

import { CalendarRepository } from "../repositories/calendar.repository";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { BlockDatesUseCase } from "../use-cases/block-dates.use-case";
import { revalidatePath } from "next/cache";

export async function blockDatesAction(dateStrs: string[], reason: string) {
  try {
    const calendarRepository = new CalendarRepository();
    const bookingRepository = new BookingRepository();
    const useCase = new BlockDatesUseCase(calendarRepository, bookingRepository);

    const dates = dateStrs.map((d) => new Date(d));
    const result = await useCase.execute(dates, reason);

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/booking");

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("blockDatesAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal memblokir tanggal-tanggal tersebut." };
  }
}
