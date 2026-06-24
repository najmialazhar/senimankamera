import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";
import { adminProfileRepository } from "@/src/modules/admin-management/repositories/admin-profile.repository";
import { AdminManager } from "@/src/modules/admin-management/components/admin-manager";

export const revalidate = 0;

export default async function AdminManagementPage() {
  // Enforce session check: only SUPER_ADMIN can open admin management
  const currentAdmin = await enforceAdminRole([AdminRole.SUPER_ADMIN]);

  // Load all admin profiles
  const rawAdmins = await adminProfileRepository.findAll();
  const admins = JSON.parse(JSON.stringify(rawAdmins));

  return (
    <AdminManager
      admins={admins}
      currentAdmin={JSON.parse(JSON.stringify(currentAdmin))}
    />
  );
}
