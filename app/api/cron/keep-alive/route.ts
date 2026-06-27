import { prisma } from "@/src/infrastructure/prisma/client";

export const dynamic = "force-dynamic";

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
    // Perform a lightweight database query to keep the database active
    await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({ 
      success: true, 
      message: "Database pinged successfully.",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error running keep-alive cron:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
