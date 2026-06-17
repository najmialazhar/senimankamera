"use server";

import { CalendarRepository } from "../repositories/calendar.repository";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { BlockDateUseCase } from "../use-cases/block-date.use-case";
import { revalidatePath } from "next/cache";

export async function blockDateAction(dateStr: string, reason: string) {
  try {
    const calendarRepository = new CalendarRepository();
    const bookingRepository = new BookingRepository();
    const useCase = new BlockDateUseCase(calendarRepository, bookingRepository);

    const date = new Date(dateStr);
    const result = await useCase.execute(date, reason);

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/booking"); // Ensure frontend booking calendar gets updated slots

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("blockDateAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal memblokir tanggal." };
  }
}
