import { BookingDraftRepository } from "@/src/modules/booking/repositories/booking-draft.repository";

export async function GET(request: Request) {
  // Verify CRON_SECRET header to ensure only authorized callers can trigger it
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get("Authorization");
  
  const cronSecret = process.env.CRON_SECRET;
  
  // Accept secret via Authorization header (Bearer token) or query parameter
  const token = authHeader?.replace("Bearer ", "") || searchParams.get("secret");

  if (cronSecret && token !== cronSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const draftRepo = new BookingDraftRepository();
    const result = await draftRepo.deleteExpiredDrafts();
    return Response.json({ success: true, deletedCount: result.count });
  } catch (error: any) {
    console.error("Error running draft cleanup cron:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
