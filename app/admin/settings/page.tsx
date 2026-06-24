import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";
import { adminProfileRepository } from "@/src/modules/admin-management/repositories/admin-profile.repository";
import { getTermsContentAction } from "@/src/modules/booking/actions/get-terms-content.action";
import { SettingsManager } from "@/src/modules/booking/components/settings-manager";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  // Enforce session check: SUPER_ADMIN or ADMIN_CMS can open settings
  const currentAdmin = await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_CMS]);

  // Load default or existing terms
  const [timeBasedRes, dateOnlyRes] = await Promise.all([
    getTermsContentAction("TIME_BASED"),
    getTermsContentAction("DATE_ONLY"),
  ]);

  const tncTimeBased = timeBasedRes.success ? timeBasedRes.data || "" : "";
  const tncDateOnly = dateOnlyRes.success ? dateOnlyRes.data || "" : "";

  // Load other admin profiles only if current user is SUPER_ADMIN
  let admins: any[] = [];
  if (currentAdmin.role === AdminRole.SUPER_ADMIN) {
    const rawAdmins = await adminProfileRepository.findAll();
    admins = JSON.parse(JSON.stringify(rawAdmins));
  }

  return (
    <SettingsManager
      initialTncTimeBased={tncTimeBased}
      initialTncDateOnly={tncDateOnly}
      admins={admins}
      currentAdmin={JSON.parse(JSON.stringify(currentAdmin))}
    />
  );
}

