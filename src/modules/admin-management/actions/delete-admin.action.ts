"use server";

import { createClient } from "@/src/infrastructure/supabase/server";
import { adminProfileRepository } from "../repositories/admin-profile.repository";
import { deleteAdminUseCase } from "../use-cases/delete-admin.use-case";
import { revalidatePath } from "next/cache";

export async function deleteAdminAction(id: string) {
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
      return { error: "Akses ditolak. Hanya Super Admin yang dapat menghapus admin secara permanen." };
    }

    // 3. Execute use case
    const profile = await deleteAdminUseCase.execute(id, user.id);

    // 4. Revalidate cache
    revalidatePath("/admin/admins");
    revalidatePath("/admin/settings");

    return { success: true, data: profile };
  } catch (error: any) {
    console.error("deleteAdminAction error caught:", error);
    return { error: error instanceof Error ? error.message : "Terjadi kesalahan sistem." };
  }
}
