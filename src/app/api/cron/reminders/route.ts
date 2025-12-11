import { NextResponse } from "next/server";

/**
 * Cron Job: Daily Reminders
 * Runs at 08:00 AM daily (configured in vercel.json)
 * Sends reminder emails for requests with items due tomorrow
 * 
 * PRD Section 3.7: Cron Job (Nhắc việc)
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // TODO: Implement reminder logic
    // 1. Query request_items where required_at = tomorrow
    // 2. Filter requests not in DONE/CANCELLED status
    // 3. Group by assignee
    // 4. Send reminder emails via Resend

    console.log("[CRON] Daily reminders job started at", new Date().toISOString());

    // Placeholder response
    return NextResponse.json({
      success: true,
      message: "Reminder job completed",
      timestamp: new Date().toISOString(),
      // TODO: Add actual stats
      stats: {
        emailsSent: 0,
        requestsProcessed: 0,
      },
    });
  } catch (error) {
    console.error("[CRON] Error in reminder job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
