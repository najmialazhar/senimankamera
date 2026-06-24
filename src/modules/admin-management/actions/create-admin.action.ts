"use server";

import { createClient } from "@/src/infrastructure/supabase/server";
import { adminProfileRepository } from "../repositories/admin-profile.repository";
import { createAdminUseCase } from "../use-cases/create-admin.use-case";
import { CreateAdminInput } from "../schemas/create-admin.schema";
import { AdminRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createAdminAction(input: CreateAdminInput) {
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
    if (!callerProfile || callerProfile.role !== AdminRole.SUPER_ADMIN || !callerProfile.isActive) {
      return { error: "Akses ditolak. Hanya Super Admin yang dapat menambahkan admin baru." };
    }

    // 3. Execute use case
    const profile = await createAdminUseCase.execute(input);

    // 4. Revalidate cache
    revalidatePath("/admin/settings");

    return { success: true, data: profile };
  } catch (error: any) {
    console.error("createAdminAction error caught:", error);
    return { error: error instanceof Error ? error.message : "Terjadi kesalahan sistem." };
  }
}
