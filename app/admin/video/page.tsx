import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";
import { getHomepageVideoAction } from "@/src/modules/booking/actions/get-homepage-video.action";
import { VideoManager } from "@/src/modules/booking/components/video-manager";

export const revalidate = 0;

export default async function AdminVideoPage() {
  // Enforce session check: SUPER_ADMIN or ADMIN_CMS can manage video showcase
  await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_CMS]);

  // Load existing homepage video & text settings
  const videoRes = await getHomepageVideoAction();
  const initialData = videoRes.success ? videoRes.data : undefined;

  return <VideoManager initialData={initialData} />;
}
