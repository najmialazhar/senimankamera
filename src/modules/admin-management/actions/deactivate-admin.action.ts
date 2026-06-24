"use server";

import { createClient } from "@/src/infrastructure/supabase/server";
import { adminProfileRepository } from "../repositories/admin-profile.repository";
import { deactivateAdminUseCase } from "../use-cases/deactivate-admin.use-case";
import { revalidatePath } from "next/cache";

export async function deactivateAdminAction(id: string) {
  try {
    // 1. Get current logged-in user
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Sesi tidak valid. Silakan login kembali." };
    }

    // 2. Check caller's role
    const callerProfile = await adminProfileRepository.findBySupabaseId(user.id);
    if (!callerProfile || callerProfile.role !== "SUPER_ADMIN" || !callerProfile.isActive) {
      return { error: "Akses ditolak. Hanya Super Admin yang dapat menonaktifkan admin." };
    }

    // 3. Execute use case
    const profile = await deactivateAdminUseCase.execute(id, user.id);

    // 4. Revalidate cache
    revalidatePath("/admin/settings");

    return { success: true, data: profile };
  } catch (error: any) {
    console.error("deactivateAdminAction error caught:", error);
    return { error: error instanceof Error ? error.message : "Terjadi kesalahan sistem." };
  }
}
