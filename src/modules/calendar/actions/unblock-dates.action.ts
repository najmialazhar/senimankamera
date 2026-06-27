"use server";

import { CalendarRepository } from "../repositories/calendar.repository";
import { UnblockDatesUseCase } from "../use-cases/unblock-dates.use-case";
import { revalidatePath } from "next/cache";

export async function unblockDatesAction(dateStrs: string[]) {
  try {
    const calendarRepository = new CalendarRepository();
    const useCase = new UnblockDatesUseCase(calendarRepository);

    const dates = dateStrs.map((d) => new Date(d));
    const result = await useCase.execute(dates);

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/booking");

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("unblockDatesAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuka blokir tanggal-tanggal tersebut." };
  }
}
