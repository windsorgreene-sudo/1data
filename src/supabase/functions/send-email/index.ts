import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rate limiting with in-memory store (resets on function restart)
const emailRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Email-based limits (stricter - per sender)
const EMAIL_RATE_LIMIT = 5; // Max 5 emails per hour per email address
// IP-based limits (more permissive - multiple users may share IP)
const IP_RATE_LIMIT = 20; // Max 20 emails per hour per IP
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validateEmail(email: string): boolean {
  // RFC 5322 compliant email regex pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Additional validation rules
  if (!email || email.length > 255) {
    return false;
  }
  
  // Check format
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Verify email has valid domain structure
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }
  
  const [localPart, domain] = parts;
  
  // Local part validation
  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }
  
  // Domain validation
  if (domain.length === 0 || domain.length > 253) {
    return false;
  }
  
  // Must have at least one dot in domain
  if (!domain.includes('.')) {
    return false;
  }
  
  // TLD must be at least 2 characters
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return false;
  }
  
  return true;
}

function validateName(name: string): boolean {
  // Allow letters, spaces, hyphens, apostrophes, and common international characters
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return name.length > 0 && name.length <= 100 && nameRegex.test(name.trim());
}

function checkRateLimit(
  map: Map<string, { count: number; resetTime: number }>,
  identifier: string,
  limit: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = map.get(identifier);

  if (!record || now > record.resetTime) {
    map.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

function getClientIP(req: Request): string {
  // Check common headers for client IP (in order of reliability)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first (original client)
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }
  
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  // Fallback to a generic identifier if no IP found
  return "unknown-ip";
}

interface ContactEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      subject,
      message,
      timestamp,
    }: ContactEmailRequest = await req.json();

    // Input validation - Check for required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Trim all string inputs to remove leading/trailing whitespace
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    // Validate name fields with regex
    if (!validateName(trimmedFirstName)) {
      return new Response(
        JSON.stringify({ error: "Invalid first name format. Use only letters, spaces, hyphens, and apostrophes." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!validateName(trimmedLastName)) {
      return new Response(
        JSON.stringify({ error: "Invalid last name format. Use only letters, spaces, hyphens, and apostrophes." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format with comprehensive regex
    if (!validateEmail(trimmedEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate subject length
    if (trimmedSubject.length === 0 || trimmedSubject.length > 200) {
      return new Response(
        JSON.stringify({ error: "Subject must be between 1 and 200 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate message length
    if (trimmedMessage.length === 0 || trimmedMessage.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message must be between 1 and 5000 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(req);
    
    // Check IP-based rate limit first (catches spam from single source)
    const ipRateCheck = checkRateLimit(ipRateLimitMap, clientIP, IP_RATE_LIMIT);
    if (!ipRateCheck.allowed) {
      console.log(`IP rate limit exceeded for: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            ...corsHeaders 
          } 
        }
      );
    }

    // Check email-based rate limit (prevents email spoofing abuse)
    const emailRateCheck = checkRateLimit(emailRateLimitMap, trimmedEmail, EMAIL_RATE_LIMIT);
    if (!emailRateCheck.allowed) {
      console.log(`Email rate limit exceeded for: ${email}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            ...corsHeaders 
          } 
        }
      );
    }

    // Validate required environment variables
    const gmailEmail = Deno.env.get("GMAIL_EMAIL");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    
    if (!gmailEmail || !gmailPassword) {
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

    // Create email content
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>You have received a new message from your website contact form.</p>
        </div>
        <div class="content">
            <div class="info-row">
                <span class="label">Name:</span> ${escapeHtml(trimmedFirstName)} ${escapeHtml(trimmedLastName)}
            </div>
            <div class="info-row">
                <span class="label">Email:</span> ${escapeHtml(trimmedEmail)}
            </div>
            <div class="info-row">
                <span class="label">Subject:</span> ${escapeHtml(trimmedSubject)}
            </div>
            <div class="info-row">
                <span class="label">Timestamp:</span> ${escapeHtml(new Date(timestamp).toLocaleString())}
            </div>
            
            <div class="message-box">
                <div class="label">Message:</div>
                <p>${escapeHtml(trimmedMessage).replace(/\n/g, '<br>')}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    // Send email
    await client.send({
      from: Deno.env.get("GMAIL_EMAIL")!,
      to: Deno.env.get("GMAIL_EMAIL")!,
      subject: `Contact Form: ${trimmedSubject}`,
      content: emailContent,
      html: emailContent,
    });

    await client.close();

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": emailRateCheck.remaining.toString(),
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending email");
    return new Response(
      JSON.stringify({ error: "Failed to send message. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);