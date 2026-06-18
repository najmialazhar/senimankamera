"use server";

import { SiteSettingsRepository } from "../repositories/site-settings.repository";
import { revalidatePath } from "next/cache";

export async function updateTermsContentAction(data: {
  tncTimeBased: string;
  tncDateOnly: string;
}) {
  try {
    const repo = new SiteSettingsRepository();

    await Promise.all([
      repo.upsert(
        "tnc_time_based",
        data.tncTimeBased,
        "Syarat & Ketentuan Sesi Studio (Time-Based)"
      ),
      repo.upsert(
        "tnc_date_only",
        data.tncDateOnly,
        "Syarat & Ketentuan Acara/Dokumentasi (Date-Only)"
      ),
    ]);

    revalidatePath("/admin/settings");
    revalidatePath("/book");

    return { success: true };
  } catch (error: any) {
    console.error("updateTermsContentAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui syarat & ketentuan.",
    };
  }
}
