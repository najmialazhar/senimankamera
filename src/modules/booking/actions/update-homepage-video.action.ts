"use server";

import { UpdateHomepageVideoUseCase } from "../use-cases/update-homepage-video.use-case";
import { HomepageVideoInput } from "../schemas/homepage-video.schema";
import { revalidatePath } from "next/cache";

export async function updateHomepageVideoAction(input: HomepageVideoInput) {
  try {
    const useCase = new UpdateHomepageVideoUseCase();
    await useCase.execute(input);

    revalidatePath("/");
    revalidatePath("/admin/video");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to update homepage video URL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui video beranda.",
    };
  }
}
