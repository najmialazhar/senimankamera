"use server";

import { prisma } from "@/src/infrastructure/prisma/client";

export async function getPublicCalendarAction() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await prisma.calendarSlot.findMany({
      where: {
        date: { gte: today },
        status: {
          in: ["PENDING", "APPROVED", "LUNAS", "ManualBooking", "ManualBlock", "TIME_BASED_ACTIVE"],
        },
      },
      select: {
        date: true,
        status: true,
      },
    });

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const bookedDatesSet = new Set<string>();
    const timeBasedDatesSet = new Set<string>();

    for (const slot of slots) {
      const dateKey = formatDate(slot.date);
      if (slot.status === "TIME_BASED_ACTIVE") {
        timeBasedDatesSet.add(dateKey);
      } else {
        bookedDatesSet.add(dateKey);
      }
    }

    return {
      success: true,
      data: {
        bookedDates: Array.from(bookedDatesSet),
        timeBasedDates: Array.from(timeBasedDatesSet),
      },
    };
  } catch (error: any) {
    console.error("getPublicCalendarAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
      data: { bookedDates: [], timeBasedDates: [] },
    };
  }
}
