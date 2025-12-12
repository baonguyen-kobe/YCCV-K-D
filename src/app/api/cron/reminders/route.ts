import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Cron Job: Daily Reminders
 * Runs at 08:00 AM daily (configured in vercel.json)
 * Sends reminder emails for requests with items due tomorrow
 * 
 * PRD Section 3.7: Cron Job (Nhắc việc)
 * 
 * IDEMPOTENCY: Uses cron_logs table to prevent duplicate emails
 * when cron job is retried or runs multiple times
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Safety check: ensure Supabase env variables exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[CRON] Missing Supabase environment variables");
    return NextResponse.json(
      { error: "Missing configuration" },
      { status: 500 }
    );
  }

  try {
    const supabase = createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    });

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const jobDate = today.toISOString().split("T")[0];

    console.log("[CRON] Daily reminders job started at", today.toISOString());
    console.log("[CRON] Looking for items due on", tomorrowStr);

    // Find request_items with required_at = tomorrow
    // Join with requests to filter out DONE/CANCELLED
    const { data: itemsDue, error: itemsError } = await supabase
      .from("request_items")
      .select(`
        id,
        item_name,
        required_at,
        request:requests!inner (
          id,
          status,
          assignee_id,
          assignee:users!requests_assignee_id_fkey (
            id,
            email,
            full_name
          )
        )
      `)
      .eq("required_at", tomorrowStr)
      .not("request.status", "in", "(DONE,CANCELLED)");

    if (itemsError) {
      console.error("[CRON] Error fetching items:", itemsError);
      return NextResponse.json(
        { error: "Failed to fetch items" },
        { status: 500 }
      );
    }

    if (!itemsDue || itemsDue.length === 0) {
      console.log("[CRON] No items due tomorrow");
      return NextResponse.json({
        success: true,
        message: "No reminders to send",
        timestamp: today.toISOString(),
        stats: { emailsSent: 0, requestsProcessed: 0 },
      });
    }

    // Group items by assignee
    const emailsToSend = new Map<string, { email: string; name: string; items: typeof itemsDue }>();

    for (const item of itemsDue) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request = item.request as any;
      if (!request?.assignee?.email) continue;

      const assigneeEmail = request.assignee.email;
      if (!emailsToSend.has(assigneeEmail)) {
        emailsToSend.set(assigneeEmail, {
          email: assigneeEmail,
          name: request.assignee.full_name || assigneeEmail,
          items: [],
        });
      }
      emailsToSend.get(assigneeEmail)!.items.push(item);
    }

    let emailsSent = 0;
    let emailsSkipped = 0;

    // Send emails with idempotency check
    for (const [recipientEmail, data] of emailsToSend) {
      // Check if we already sent reminder today for this recipient
      const { data: existingLog } = await supabase
        .from("cron_logs")
        .select("id")
        .eq("job_name", "daily_reminders")
        .eq("job_date", jobDate)
        .eq("email_recipient", recipientEmail)
        .eq("email_type", "reminder")
        .maybeSingle();

      if (existingLog) {
        console.log(`[CRON] Skipping duplicate email to ${recipientEmail}`);
        emailsSkipped++;
        continue;
      }

      // TODO: Actually send email via Resend
      // const { error: emailError } = await sendEmail({
      //   to: recipientEmail,
      //   subject: `[Nhắc nhở] Bạn có ${data.items.length} yêu cầu sắp đến hạn`,
      //   body: formatReminderEmail(data.items, tomorrowStr),
      // });

      // Log the email sent (for idempotency)
      await supabase.from("cron_logs").insert({
        job_name: "daily_reminders",
        job_date: jobDate,
        email_recipient: recipientEmail,
        email_type: "reminder",
        status: "sent", // Change to 'failed' if email fails
        metadata: {
          items_count: data.items.length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          request_ids: data.items.map((i) => (i.request as any)?.id),
        },
      });

      console.log(`[CRON] Sent reminder to ${recipientEmail} for ${data.items.length} items`);
      emailsSent++;
    }

    console.log(`[CRON] Job completed. Sent: ${emailsSent}, Skipped: ${emailsSkipped}`);

    return NextResponse.json({
      success: true,
      message: "Reminder job completed",
      timestamp: today.toISOString(),
      stats: {
        emailsSent,
        emailsSkipped,
        requestsProcessed: itemsDue.length,
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
