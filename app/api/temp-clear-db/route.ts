import { NextResponse } from "next/server";
import { prisma } from "@/src/infrastructure/prisma/client";

export const revalidate = 0; // Dynamic route

export async function GET() {
  try {
    const txCount = await prisma.paymentTransaction.deleteMany({});
    const slotCount = await prisma.calendarSlot.deleteMany({});
    const bookingCount = await prisma.booking.deleteMany({});
    const clientCount = await prisma.client.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "Database pemesanan berhasil dikosongkan!",
      details: {
        transactions: txCount.count,
        slots: slotCount.count,
        bookings: bookingCount.count,
        clients: clientCount.count,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
