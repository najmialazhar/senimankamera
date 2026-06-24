"use server";

import { BookingDraftRepository } from "../repositories/booking-draft.repository";
import { BookingRepository } from "../repositories/booking.repository";
import { InitiateBookingDraftUseCase } from "../use-cases/initiate-booking-draft.use-case";
import { InitiateBookingDraftInputType } from "../schemas/booking-draft.schema";
import { headers } from "next/headers";

export async function initiateDraftBookingAction(input: InitiateBookingDraftInputType) {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const bookingDraftRepository = new BookingDraftRepository();
    const bookingRepository = new BookingRepository();
    const useCase = new InitiateBookingDraftUseCase(bookingDraftRepository, bookingRepository);
    const draft = await useCase.execute(input, baseUrl);

    return {
      success: true,
      data: {
        id: draft.id,
        snapToken: draft.snapToken,
        snapUrl: draft.snapUrl,
        dpAmount: draft.dpAmount,
        totalAmount: draft.totalAmount,
      },
    };
  } catch (error: any) {
    console.error("initiateDraftBookingAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
