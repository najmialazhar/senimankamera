import { createAdminClient } from "@/src/infrastructure/supabase/admin";
import { adminProfileRepository } from "../repositories/admin-profile.repository";
import { AdminProfile } from "@prisma/client";

export class DeleteAdminUseCase {
  async execute(id: string, currentAdminSupabaseId: string): Promise<AdminProfile> {
    const allProfiles = await adminProfileRepository.findAll();
    const target = allProfiles.find((p) => p.id === id);

    if (!target) {
      throw new Error("Admin tidak ditemukan.");
    }

    if (target.supabaseId === currentAdminSupabaseId) {
      throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
    }

    if (target.isActive) {
      throw new Error("Akun admin harus dinonaktifkan terlebih dahulu sebelum dapat dihapus.");
    }

    const supabaseAdmin = createAdminClient();

    // Hapus user di Supabase Auth agar tidak bisa login lagi
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(target.supabaseId);
    if (authError) {
      // Jika user tidak ditemukan di Supabase Auth atau gagal, log peringatan tapi tetap hapus dari database
      console.warn("Peringatan: User Supabase Auth tidak ditemukan atau gagal dihapus:", authError.message);
    }

    // Hapus data secara permanen dari database
    return adminProfileRepository.delete(id);
  }
}

export const deleteAdminUseCase = new DeleteAdminUseCase();
