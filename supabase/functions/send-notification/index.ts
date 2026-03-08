const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "alimranmuslimaid@gmail.com";

interface NotificationPayload {
  type: "donation" | "volunteer" | "membership" | "contact" | "item_donation";
  data: Record<string, unknown>;
}

function buildEmailContent(payload: NotificationPayload): { subject: string; html: string } {
  const { type, data } = payload;
  const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Africa/Kampala" });

  switch (type) {
    case "donation":
      return {
        subject: `💰 New Donation: $${data.amount} from ${data.donor_name || "Anonymous"}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#1a5632;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;">New Donation Received</h1>
            </div>
            <div style="background:#f9f9f9;padding:24px;border:1px solid #e0e0e0;border-radius:0 0 8px 8px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Amount:</td><td style="padding:8px 0;font-size:18px;color:#1a5632;font-weight:bold;">$${data.amount}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Donor:</td><td style="padding:8px 0;">${data.donor_name || "Anonymous"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Email:</td><td style="padding:8px 0;">${data.donor_email || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Method:</td><td style="padding:8px 0;">${data.payment_method || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Type:</td><td style="padding:8px 0;">${data.is_recurring ? "Monthly Recurring" : "One-time"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Date:</td><td style="padding:8px 0;">${timestamp}</td></tr>
              </table>
            </div>
            <p style="text-align:center;color:#999;font-size:12px;margin-top:16px;">Al-Imran Muslim Aid — Admin Notification</p>
          </div>`,
      };

    case "volunteer":
      return {
        subject: `🤝 New Volunteer Application: ${data.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#1a5632;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;">New Volunteer Application</h1>
            </div>
            <div style="background:#f9f9f9;padding:24px;border:1px solid #e0e0e0;border-radius:0 0 8px 8px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Name:</td><td style="padding:8px 0;">${data.name}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Email:</td><td style="padding:8px 0;">${data.email}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Phone:</td><td style="padding:8px 0;">${data.phone || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Interest:</td><td style="padding:8px 0;">${data.area_of_interest || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Skills:</td><td style="padding:8px 0;">${data.skills || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Availability:</td><td style="padding:8px 0;">${data.availability || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Date:</td><td style="padding:8px 0;">${timestamp}</td></tr>
              </table>
            </div>
            <p style="text-align:center;color:#999;font-size:12px;margin-top:16px;">Al-Imran Muslim Aid — Admin Notification</p>
          </div>`,
      };

    case "membership":
      return {
        subject: `⭐ New Membership: ${data.tier} — ${data.donor_name || data.donor_email}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#1a5632;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;">New Membership Registration</h1>
            </div>
            <div style="background:#f9f9f9;padding:24px;border:1px solid #e0e0e0;border-radius:0 0 8px 8px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Name:</td><td style="padding:8px 0;">${data.donor_name || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Email:</td><td style="padding:8px 0;">${data.donor_email}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Tier:</td><td style="padding:8px 0;font-weight:bold;text-transform:capitalize;">${data.tier}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Date:</td><td style="padding:8px 0;">${timestamp}</td></tr>
              </table>
            </div>
            <p style="text-align:center;color:#999;font-size:12px;margin-top:16px;">Al-Imran Muslim Aid — Admin Notification</p>
          </div>`,
      };

    case "contact":
      return {
        subject: `📩 New Contact Message: ${data.subject || "No Subject"} — from ${data.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#1a5632;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;">New Contact Message</h1>
            </div>
            <div style="background:#f9f9f9;padding:24px;border:1px solid #e0e0e0;border-radius:0 0 8px 8px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Name:</td><td style="padding:8px 0;">${data.name}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Email:</td><td style="padding:8px 0;">${data.email}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Subject:</td><td style="padding:8px 0;">${data.subject || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Date:</td><td style="padding:8px 0;">${timestamp}</td></tr>
              </table>
              <div style="margin-top:16px;padding:16px;background:white;border-radius:6px;border:1px solid #e0e0e0;">
                <p style="margin:0;color:#333;white-space:pre-wrap;">${data.message}</p>
              </div>
            </div>
            <p style="text-align:center;color:#999;font-size:12px;margin-top:16px;">Al-Imran Muslim Aid — Admin Notification</p>
          </div>`,
      };

    case "item_donation":
      return {
        subject: `📦 New Item Donation from ${data.donor_name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#1a5632;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;">New Item Donation</h1>
            </div>
            <div style="background:#f9f9f9;padding:24px;border:1px solid #e0e0e0;border-radius:0 0 8px 8px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Donor:</td><td style="padding:8px 0;">${data.donor_name}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Email:</td><td style="padding:8px 0;">${data.donor_email}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Phone:</td><td style="padding:8px 0;">${data.donor_phone || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Category:</td><td style="padding:8px 0;">${data.category || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Items:</td><td style="padding:8px 0;">${data.item_description}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Pickup:</td><td style="padding:8px 0;">${data.pickup_location || "N/A"}</td></tr>
                <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Date:</td><td style="padding:8px 0;">${timestamp}</td></tr>
              </table>
            </div>
            <p style="text-align:center;color:#999;font-size:12px;margin-top:16px;">Al-Imran Muslim Aid — Admin Notification</p>
          </div>`,
      };

    default:
      return { subject: "New Notification", html: "<p>A new event occurred.</p>" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const payload: NotificationPayload = await req.json();
    const { subject, html } = buildEmailContent(payload);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Al-Imran Muslim Aid <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject,
        html,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Resend API error:", result);
      throw new Error(`Email send failed: ${JSON.stringify(result)}`);
    }

    console.log("Notification email sent:", result.id);
    return new Response(JSON.stringify({ success: true, email_id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Notification email error:", error);
    return new Response(JSON.stringify({ error: "Failed to send notification" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
