import { adminProfileRepository } from "../repositories/admin-profile.repository";
import { AdminProfile, AdminRole } from "@prisma/client";

export class UpdateAdminRoleUseCase {
  async execute(
    id: string,
    role: AdminRole,
    currentAdminSupabaseId: string
  ): Promise<AdminProfile> {
    const allProfiles = await adminProfileRepository.findAll();
    const target = allProfiles.find((p) => p.id === id);

    if (!target) {
      throw new Error("Admin tidak ditemukan.");
    }

    if (target.supabaseId === currentAdminSupabaseId) {
      throw new Error("Anda tidak dapat mengubah peran akun Anda sendiri.");
    }

    // Jika target adalah SUPER_ADMIN, pastikan setidaknya ada satu SUPER_ADMIN lain yang aktif agar tidak lockout
    if (target.role === AdminRole.SUPER_ADMIN && role !== AdminRole.SUPER_ADMIN) {
      const activeSuperAdmins = allProfiles.filter(
        (p) => p.role === AdminRole.SUPER_ADMIN && p.isActive
      );
      if (activeSuperAdmins.length <= 1) {
        throw new Error(
          "Tidak dapat mengubah peran satu-satunya Super Admin yang tersisa."
        );
      }
    }

    return adminProfileRepository.updateRole(id, role);
  }
}

export const updateAdminRoleUseCase = new UpdateAdminRoleUseCase();
