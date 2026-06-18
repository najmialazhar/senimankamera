import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";
import { getTermsContentAction } from "@/src/modules/booking/actions/get-terms-content.action";
import { SettingsManager } from "@/src/modules/booking/components/settings-manager";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
