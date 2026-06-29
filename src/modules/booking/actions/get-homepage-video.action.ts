"use server";

import { GetHomepageVideoUseCase } from "../use-cases/get-homepage-video.use-case";

export async function getHomepageVideoAction() {
  try {
    const useCase = new GetHomepageVideoUseCase();
    const data = await useCase.execute();
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to fetch homepage video URL:", error);
    return { success: false, error: "Gagal mengambil konfigurasi video beranda." };
  }
}
