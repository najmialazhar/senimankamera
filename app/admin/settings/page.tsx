import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";
import { getTermsContentAction } from "@/src/modules/booking/actions/get-terms-content.action";
import { SettingsManager } from "@/src/modules/booking/components/settings-manager";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  // Enforce session check: SUPER_ADMIN or ADMIN_CMS can open settings
  await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_CMS]);

  // Load default or existing terms
  const [timeBasedRes, dateOnlyRes] = await Promise.all([
    getTermsContentAction("TIME_BASED"),
    getTermsContentAction("DATE_ONLY"),
  ]);

  const tncTimeBased = timeBasedRes.success ? timeBasedRes.data || "" : "";
  const tncDateOnly = dateOnlyRes.success ? dateOnlyRes.data || "" : "";

  return (
    <SettingsManager
      initialTncTimeBased={tncTimeBased}
      initialTncDateOnly={tncDateOnly}
    />
  );
}
