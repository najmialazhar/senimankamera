import { createAdminClient } from "@/src/infrastructure/supabase/admin";
import { adminProfileRepository } from "../repositories/admin-profile.repository";
import { AdminProfile } from "@prisma/client";

export class DeactivateAdminUseCase {
  async execute(id: string, currentAdminSupabaseId: string): Promise<AdminProfile> {
    const allProfiles = await adminProfileRepository.findAll();
    const target = allProfiles.find((p) => p.id === id);

    if (!target) {
      throw new Error("Admin tidak ditemukan.");
    }

    if (target.role === "SUPER_ADMIN") {
      throw new Error("Super Admin tidak dapat dinonaktifkan.");
    }

    if (target.supabaseId === currentAdminSupabaseId) {
      throw new Error("Anda tidak dapat menonaktifkan akun Anda sendiri.");
    }

    const supabaseAdmin = createAdminClient();

    // Hapus user di Supabase Auth agar tidak bisa login lagi
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(target.supabaseId);
    if (authError) {
      // Jika user tidak ditemukan di Supabase Auth, lanjutkan penonaktifan di DB
      console.warn("Peringatan: User Supabase Auth tidak ditemukan atau gagal dihapus:", authError.message);
    }

    // Set status di DB menjadi tidak aktif
    return adminProfileRepository.setActive(id, false);
  }
}

export const deactivateAdminUseCase = new DeactivateAdminUseCase();
