"use server";

import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender configuration
const FROM_EMAIL = process.env.EMAIL_FROM || "YCCV System <noreply@yccv.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yccv-kdd.vercel.app";

// ============================================================
// TYPES
// ============================================================

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface RequestEmailData {
  requestId: string;
  requestNumber: number;
  reason: string;
  priority: string;
  creatorName: string;
  creatorEmail: string;
  unitName?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  note?: string;
  deadline?: string;
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

function getBaseEmailStyle(): string {
  return `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; }
      .footer { background: #e9ecef; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6c757d; }
      .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
      .btn:hover { background: #5a6fd6; }
      .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea; }
      .priority-urgent { color: #dc3545; font-weight: bold; }
      .priority-high { color: #fd7e14; font-weight: bold; }
      .priority-normal { color: #0d6efd; }
      .priority-low { color: #6c757d; }
    </style>
  `;
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    URGENT: "🔴 Khẩn cấp",
    HIGH: "🟠 Cao",
    NORMAL: "🔵 Bình thường",
    LOW: "⚪ Thấp",
  };
  return labels[priority] || priority;
}

function getPriorityClass(priority: string): string {
  return `priority-${priority.toLowerCase()}`;
}

// ============================================================
// EMAIL SENDING FUNCTIONS
// ============================================================

/**
 * Send email when a new request is created (Status: NEW)
 * Recipients: Managers of the unit
 */
export async function sendNewRequestEmail(
  data: RequestEmailData,
  managerEmails: string[]
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY || managerEmails.length === 0) {
    console.log("[EMAIL] Skipping - no API key or recipients");
    return { success: true };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${getBaseEmailStyle()}</head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📋 Phiếu yêu cầu mới #${data.requestNumber}</h2>
        </div>
        <div class="content">
          <p>Kính gửi Đội vận hành,</p>
          <p>Hệ thống vừa ghi nhận một yêu cầu mới cần xử lý:</p>
          
          <div class="info-box">
            <p><strong>Người tạo:</strong> ${data.creatorName} (${data.unitName || "N/A"})</p>
            <p><strong>Mức độ ưu tiên:</strong> <span class="${getPriorityClass(data.priority)}">${getPriorityLabel(data.priority)}</span></p>
            <p><strong>Lý do/Nội dung:</strong> ${data.reason.substring(0, 200)}${data.reason.length > 200 ? "..." : ""}</p>
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="${APP_URL}/requests/${data.requestId}" class="btn">Xem chi tiết phiếu</a>
          </p>
        </div>
        <div class="footer">
          <p>Email tự động từ Hệ thống YCCV - Khoa Điều dưỡng EIU</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: managerEmails,
      subject: `[YCCV] Phiếu yêu cầu mới #${data.requestNumber} - ${data.creatorName}`,
      html,
    });

    if (result.error) {
      console.error("[EMAIL] Send error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[EMAIL] Exception:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send email when request is assigned (Status: ASSIGNED)
 * Recipients: Assigned staff member
 */
export async function sendAssignedEmail(data: RequestEmailData): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY || !data.assigneeEmail) {
    console.log("[EMAIL] Skipping - no API key or assignee");
    return { success: true };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${getBaseEmailStyle()}</head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📌 Bạn được phân công xử lý phiếu #${data.requestNumber}</h2>
        </div>
        <div class="content">
          <p>Chào ${data.assigneeName || "bạn"},</p>
          <p>Bạn vừa được phân công chịu trách nhiệm xử lý phiếu yêu cầu:</p>
          
          <div class="info-box">
            <p><strong>Người yêu cầu:</strong> ${data.creatorName}</p>
            <p><strong>Mức độ ưu tiên:</strong> <span class="${getPriorityClass(data.priority)}">${getPriorityLabel(data.priority)}</span></p>
            ${data.deadline ? `<p><strong>Hạn chót:</strong> ${data.deadline}</p>` : ""}
            ${data.note ? `<p><strong>Ghi chú phân công:</strong> ${data.note}</p>` : ""}
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="${APP_URL}/requests/${data.requestId}" class="btn">Tiếp nhận công việc</a>
          </p>
        </div>
        <div class="footer">
          <p>Email tự động từ Hệ thống YCCV - Khoa Điều dưỡng EIU</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.assigneeEmail,
      subject: `[YCCV] Bạn được phân công xử lý phiếu #${data.requestNumber}`,
      html,
    });

    if (result.error) {
      console.error("[EMAIL] Send error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[EMAIL] Exception:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send email when more info is needed (Status: NEED_INFO)
 * Recipients: Request creator
 */
export async function sendNeedInfoEmail(
  data: RequestEmailData,
  staffComment: string
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] Skipping - no API key");
    return { success: true };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${getBaseEmailStyle()}</head>
    <body>
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #fd7e14 0%, #dc3545 100%);">
          <h2>⚠️ Cần bổ sung thông tin cho phiếu #${data.requestNumber}</h2>
        </div>
        <div class="content">
          <p>Kính gửi ${data.creatorName},</p>
          <p>Bộ phận vận hành đang xử lý yêu cầu của bạn nhưng cần thêm thông tin để tiếp tục:</p>
          
          <div class="info-box" style="border-left-color: #fd7e14;">
            <p><strong>Nội dung cần làm rõ:</strong></p>
            <p style="font-style: italic;">"${staffComment}"</p>
            ${data.assigneeName ? `<p><strong>Từ:</strong> ${data.assigneeName}</p>` : ""}
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="${APP_URL}/requests/${data.requestId}#comments" class="btn" style="background: #fd7e14;">Phản hồi ngay</a>
          </p>
        </div>
        <div class="footer">
          <p>Email tự động từ Hệ thống YCCV - Khoa Điều dưỡng EIU</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.creatorEmail,
      subject: `[YCCV] Cần bổ sung thông tin cho phiếu #${data.requestNumber}`,
      html,
    });

    if (result.error) {
      console.error("[EMAIL] Send error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[EMAIL] Exception:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send email when request is completed (Status: DONE)
 * Recipients: Request creator
 */
export async function sendCompletedEmail(
  data: RequestEmailData,
  completionNote?: string
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] Skipping - no API key");
    return { success: true };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${getBaseEmailStyle()}</head>
    <body>
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
          <h2>✅ Phiếu yêu cầu #${data.requestNumber} đã hoàn tất</h2>
        </div>
        <div class="content">
          <p>Kính gửi ${data.creatorName},</p>
          <p>Yêu cầu công việc của bạn đã được xử lý hoàn tất:</p>
          
          <div class="info-box" style="border-left-color: #28a745;">
            <p><strong>Người thực hiện:</strong> ${data.assigneeName || "N/A"}</p>
            <p><strong>Thời gian hoàn thành:</strong> ${new Date().toLocaleString("vi-VN")}</p>
            ${completionNote ? `<p><strong>Ghi chú kết quả:</strong> ${completionNote}</p>` : ""}
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="${APP_URL}/requests/${data.requestId}" class="btn" style="background: #28a745;">Xem kết quả</a>
          </p>
          
          <p style="margin-top: 20px; color: #6c757d; font-size: 14px;">
            Nếu có bất kỳ vấn đề gì phát sinh, bạn có thể comment trực tiếp trên phiếu hoặc tạo phiếu mới.
          </p>
        </div>
        <div class="footer">
          <p>Email tự động từ Hệ thống YCCV - Khoa Điều dưỡng EIU</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.creatorEmail,
      subject: `[YCCV] ✅ Phiếu yêu cầu #${data.requestNumber} đã hoàn tất`,
      html,
    });

    if (result.error) {
      console.error("[EMAIL] Send error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[EMAIL] Exception:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send email when request is cancelled (Status: CANCELLED)
 * Recipients: Request creator
 */
export async function sendCancelledEmail(
  data: RequestEmailData,
  cancelReason?: string,
  cancelledByName?: string
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.log("[EMAIL] Skipping - no API key");
    return { success: true };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${getBaseEmailStyle()}</head>
    <body>
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%);">
          <h2>❌ Phiếu yêu cầu #${data.requestNumber} đã bị hủy</h2>
        </div>
        <div class="content">
          <p>Kính gửi ${data.creatorName},</p>
          <p>Yêu cầu của bạn đã chuyển sang trạng thái <strong>HỦY</strong>:</p>
          
          <div class="info-box" style="border-left-color: #6c757d;">
            <p><strong>Người hủy:</strong> ${cancelledByName || "N/A"}</p>
            ${cancelReason ? `<p><strong>Lý do:</strong> "${cancelReason}"</p>` : ""}
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="${APP_URL}/requests/${data.requestId}" class="btn" style="background: #6c757d;">Xem lại phiếu</a>
          </p>
        </div>
        <div class="footer">
          <p>Email tự động từ Hệ thống YCCV - Khoa Điều dưỡng EIU</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.creatorEmail,
      subject: `[YCCV] ❌ Phiếu yêu cầu #${data.requestNumber} đã bị hủy`,
      html,
    });

    if (result.error) {
      console.error("[EMAIL] Send error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[EMAIL] Exception:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send reminder email for upcoming deadlines (Cron job)
 * Recipients: Assigned staff
 */
export async function sendReminderEmail(
  staffEmail: string,
  staffName: string,
  upcomingItems: Array<{
    requestId: string;
    requestNumber: number;
    itemName: string;
    priority: string;
    deadline: string;
  }>
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY || upcomingItems.length === 0) {
    console.log("[EMAIL] Skipping - no API key or items");
    return { success: true };
  }

  const itemsHtml = upcomingItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">
          <a href="${APP_URL}/requests/${item.requestId}">#${item.requestNumber}</a>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${item.itemName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">
          <span class="${getPriorityClass(item.priority)}">${getPriorityLabel(item.priority)}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${item.deadline}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${getBaseEmailStyle()}</head>
    <body>
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);">
          <h2>⏰ Nhắc nhở: Có ${upcomingItems.length} công việc sắp đến hạn</h2>
        </div>
        <div class="content">
          <p>Chào ${staffName},</p>
          <p>Hệ thống nhắc nhở bạn có các yêu cầu cần hoàn thành trong <strong>NGÀY MAI</strong>:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Mã phiếu</th>
                <th style="padding: 10px; text-align: left;">Công việc</th>
                <th style="padding: 10px; text-align: left;">Ưu tiên</th>
                <th style="padding: 10px; text-align: left;">Hạn chót</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="${APP_URL}/dashboard" class="btn" style="background: #ffc107; color: #333;">Vào Dashboard công việc</a>
          </p>
        </div>
        <div class="footer">
          <p>Email tự động từ Hệ thống YCCV - Khoa Điều dưỡng EIU</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: staffEmail,
      subject: `[Nhắc nhở] ⏰ Bạn có ${upcomingItems.length} phiếu yêu cầu sắp đến hạn`,
      html,
    });

    if (result.error) {
      console.error("[EMAIL] Send error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[EMAIL] Exception:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send email when creator comments on NEED_INFO request
 * Recipients: Assigned staff (and optionally manager)
 */
export async function sendNeedInfoReplyEmail(
  data: RequestEmailData,
  commentContent: string
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY || !data.assigneeEmail) {
    console.log("[EMAIL] Skipping - no API key or assignee");
    return { success: true };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${getBaseEmailStyle()}</head>
    <body>
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);">
          <h2>💬 Người tạo đã phản hồi phiếu #${data.requestNumber}</h2>
        </div>
        <div class="content">
          <p>Chào ${data.assigneeName || "bạn"},</p>
          <p>Người tạo phiếu vừa phản hồi yêu cầu bổ sung thông tin:</p>
          
          <div class="info-box" style="border-left-color: #17a2b8;">
            <p><strong>Từ:</strong> ${data.creatorName}</p>
            <p><strong>Nội dung:</strong></p>
            <p style="font-style: italic;">"${commentContent}"</p>
          </div>
          
          <p style="text-align: center; margin-top: 20px;">
            <a href="${APP_URL}/requests/${data.requestId}#comments" class="btn" style="background: #17a2b8;">Xem phản hồi</a>
          </p>
        </div>
        <div class="footer">
          <p>Email tự động từ Hệ thống YCCV - Khoa Điều dưỡng EIU</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.assigneeEmail,
      subject: `[YCCV] Người tạo đã phản hồi phiếu #${data.requestNumber}`,
      html,
    });

    if (result.error) {
      console.error("[EMAIL] Send error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("[EMAIL] Exception:", error);
    return { success: false, error: String(error) };
  }
}
