import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type NotificationType = "ticket_created" | "ticket_updated" | "invoice_created" | "invoice_updated";

interface NotificationRequest {
  type: NotificationType;
  userId: string;
  data: Record<string, any>;
}

const getEmailTemplate = (type: NotificationType, data: Record<string, any>, userName: string): { subject: string; html: string } => {
  const baseStyles = `
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
      .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; }
      .header p { margin: 10px 0 0; opacity: 0.9; }
      .content { padding: 30px; }
      .info-card { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
      .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
      .info-row:last-child { border-bottom: none; }
      .label { color: #64748b; font-weight: 500; }
      .value { color: #1e293b; font-weight: 600; }
      .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      .status-open { background: #fef3c7; color: #92400e; }
      .status-pending { background: #fed7aa; color: #9a3412; }
      .status-paid { background: #d1fae5; color: #065f46; }
      .status-in_progress { background: #dbeafe; color: #1e40af; }
      .status-resolved, .status-closed { background: #e2e8f0; color: #475569; }
      .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
      .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; background: #f8fafc; }
    </style>
  `;

  switch (type) {
    case "ticket_created":
      return {
        subject: `Support Ticket Created - #${data.id?.slice(0, 8)}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎫 Support Ticket Created</h1>
                <p>Your support request has been submitted</p>
              </div>
              <div class="content">
                <p>Hello ${escapeHtml(userName)},</p>
                <p>We've received your support ticket and our team will review it shortly.</p>
                
                <div class="info-card">
                  <div class="info-row">
                    <span class="label">Ticket ID</span>
                    <span class="value">#${escapeHtml(data.id?.slice(0, 8) || 'N/A')}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Subject</span>
                    <span class="value">${escapeHtml(data.subject || 'N/A')}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Priority</span>
                    <span class="value">${escapeHtml(data.priority || 'medium')}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Status</span>
                    <span class="status-badge status-${data.status || 'open'}">${escapeHtml(data.status || 'open')}</span>
                  </div>
                </div>

                <p>We'll notify you when there are updates to your ticket.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} VPS Hosting. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case "ticket_updated":
      return {
        subject: `Ticket Updated - #${data.id?.slice(0, 8)} is now ${data.status}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔄 Ticket Status Updated</h1>
                <p>Your support ticket has been updated</p>
              </div>
              <div class="content">
                <p>Hello ${escapeHtml(userName)},</p>
                <p>Your support ticket has been updated with a new status.</p>
                
                <div class="info-card">
                  <div class="info-row">
                    <span class="label">Ticket ID</span>
                    <span class="value">#${escapeHtml(data.id?.slice(0, 8) || 'N/A')}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Subject</span>
                    <span class="value">${escapeHtml(data.subject || 'N/A')}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">New Status</span>
                    <span class="status-badge status-${data.status || 'open'}">${escapeHtml(data.status || 'open')}</span>
                  </div>
                </div>

                ${data.status === 'resolved' || data.status === 'closed' 
                  ? '<p>Your issue has been resolved. If you have further questions, feel free to open a new ticket.</p>'
                  : '<p>Our team is working on your request. We\'ll keep you updated on any progress.</p>'
                }
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} VPS Hosting. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case "invoice_created":
      return {
        subject: `New Invoice #${data.invoice_number} - $${data.amount}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📄 New Invoice</h1>
                <p>A new invoice has been generated for your account</p>
              </div>
              <div class="content">
                <p>Hello ${escapeHtml(userName)},</p>
                <p>A new invoice has been created for your account.</p>
                
                <div class="info-card">
                  <div class="info-row">
                    <span class="label">Invoice Number</span>
                    <span class="value">#${escapeHtml(data.invoice_number || 'N/A')}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Amount</span>
                    <span class="value" style="font-size: 20px; color: #6366f1;">$${escapeHtml(String(data.amount || '0'))}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Due Date</span>
                    <span class="value">${data.due_at ? new Date(data.due_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Status</span>
                    <span class="status-badge status-${data.status || 'pending'}">${escapeHtml(data.status || 'pending')}</span>
                  </div>
                </div>

                <p>Please ensure payment is made by the due date to avoid service interruption.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} VPS Hosting. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case "invoice_updated":
      return {
        subject: `Invoice #${data.invoice_number} Updated - ${data.status}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header" style="${data.status === 'paid' ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%);' : ''}">
                <h1>${data.status === 'paid' ? '✅ Payment Received' : '🔄 Invoice Updated'}</h1>
                <p>Your invoice status has been updated</p>
              </div>
              <div class="content">
                <p>Hello ${escapeHtml(userName)},</p>
                ${data.status === 'paid' 
                  ? '<p>Thank you! We have received your payment.</p>'
                  : '<p>Your invoice status has been updated.</p>'
                }
                
                <div class="info-card">
                  <div class="info-row">
                    <span class="label">Invoice Number</span>
                    <span class="value">#${escapeHtml(data.invoice_number || 'N/A')}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Amount</span>
                    <span class="value">$${escapeHtml(String(data.amount || '0'))}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Status</span>
                    <span class="status-badge status-${data.status || 'pending'}">${escapeHtml(data.status || 'pending')}</span>
                  </div>
                  ${data.paid_at ? `
                  <div class="info-row">
                    <span class="label">Paid On</span>
                    <span class="value">${new Date(data.paid_at).toLocaleDateString()}</span>
                  </div>
                  ` : ''}
                </div>

                ${data.status === 'paid' 
                  ? '<p>Your services will continue without interruption. Thank you for your business!</p>'
                  : '<p>If you have any questions about this invoice, please contact our support team.</p>'
                }
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} VPS Hosting. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    default:
      return {
        subject: "Notification",
        html: "<p>You have a new notification.</p>"
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header for user verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { type, userId, data }: NotificationRequest = await req.json();

    console.log(`Processing notification: ${type} for user ${userId}`);

    // Validate required fields
    if (!type || !userId || !data) {
      console.error("Missing required fields", { type, userId, data });
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, userId, data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role to fetch user email
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the caller's identity and check if they have permission
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !caller) {
      console.error("Failed to verify caller:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Authorization check: caller must be an admin/moderator OR sending notification to themselves
    const { data: callerRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    if (rolesError) {
      console.error("Failed to fetch caller roles:", rolesError);
      return new Response(
        JSON.stringify({ error: "Authorization check failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const isAdmin = callerRoles?.some(r => r.role === "admin");
    const isModerator = callerRoles?.some(r => r.role === "moderator");
    const isSupport = callerRoles?.some(r => r.role === "support");
    const isSelfNotification = caller.id === userId;

    // Allow if: admin, moderator, support, or notifying self
    if (!isAdmin && !isModerator && !isSupport && !isSelfNotification) {
      console.error(`Unauthorized: User ${caller.id} attempted to send notification to ${userId}`);
      return new Response(
        JSON.stringify({ error: "Forbidden: You don't have permission to send notifications to this user" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch user profile to get email and notification preferences
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name, notification_email_tickets, notification_email_invoices")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Failed to fetch user profile:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check user's notification preferences
    const isTicketNotification = type === "ticket_created" || type === "ticket_updated";
    const isInvoiceNotification = type === "invoice_created" || type === "invoice_updated";

    if (isTicketNotification && profile.notification_email_tickets === false) {
      console.log(`User ${userId} has disabled ticket email notifications, skipping`);
      return new Response(
        JSON.stringify({ success: true, message: "Notification skipped - user preference" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (isInvoiceNotification && profile.notification_email_invoices === false) {
      console.log(`User ${userId} has disabled invoice email notifications, skipping`);
      return new Response(
        JSON.stringify({ success: true, message: "Notification skipped - user preference" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userEmail = profile.email;
    const userName = profile.full_name || userEmail.split("@")[0];

    console.log(`Sending ${type} notification to: ${userEmail} (authorized by ${caller.id})`);

    // Get email template
    const { subject, html } = getEmailTemplate(type, data, userName);

    // Validate Gmail credentials
    const gmailEmail = Deno.env.get("GMAIL_EMAIL");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    
    if (!gmailEmail || !gmailPassword) {
      console.error("Missing Gmail credentials");
      throw new Error("Missing Gmail credentials");
    }

    // Initialize SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 587,
        tls: true,
        auth: {
          username: gmailEmail,
          password: gmailPassword,
        },
      },
    });

    // Send email
    await client.send({
      from: gmailEmail,
      to: userEmail,
      subject: subject,
      content: html,
      html: html,
    });

    await client.close();

    console.log(`Notification email sent successfully to ${userEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
