"use server";

import { CalendarRepository } from "../repositories/calendar.repository";
import { UnblockDateUseCase } from "../use-cases/unblock-date.use-case";
import { revalidatePath } from "next/cache";

export async function unblockDateAction(dateStr: string) {
  try {
    const calendarRepository = new CalendarRepository();
    const useCase = new UnblockDateUseCase(calendarRepository);

    const date = new Date(dateStr);
    const result = await useCase.execute(date);

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/booking");

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("unblockDateAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuka blokir tanggal." };
  }
}
