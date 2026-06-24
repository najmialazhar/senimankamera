"use server";

import { BookingDraftRepository } from "../repositories/booking-draft.repository";
import { revalidatePath } from "next/cache";

export async function cancelDraftBookingAction(draftId: string) {
  try {
    if (!draftId) {
      throw new Error("ID Draft tidak valid.");
    }
    const repository = new BookingDraftRepository();
    const result = await repository.deleteDraft(draftId);
    
    // Revalidate paths to refresh availability state if needed
    revalidatePath("/admin");
    revalidatePath("/book");

    return {
      success: true,
      count: result.count,
    };
  } catch (error: any) {
    console.error("cancelDraftBookingAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
