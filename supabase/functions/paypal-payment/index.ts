import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAYPAL_API_BASE = "https://api-m.paypal.com";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function sanitizeString(str: string, maxLen: number): string {
  return str.replace(/[<>"'`;]/g, "").trim().slice(0, maxLen);
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function sendNotification(type: string, data: Record<string, unknown>) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ type, data }),
    });
  } catch (e) {
    console.error("Failed to send notification:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ── Create Order ──
    if (action === "create-order") {
      const { amount, donor_name, donor_email, donor_phone, description, is_recurring, project_id, callback_url } = body;

      if (!donor_email || typeof donor_email !== "string" || !isValidEmail(donor_email)) {
        return new Response(
          JSON.stringify({ error: "A valid email address is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const numericAmount = Number(amount);
      if (!amount || isNaN(numericAmount) || numericAmount <= 0 || numericAmount > 1_000_000) {
        return new Response(
          JSON.stringify({ error: "Amount must be a positive number up to 1,000,000" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const accessToken = await getPayPalAccessToken();

      const originUrl = callback_url || new URL(req.headers.get("origin") || req.url).origin;
      const returnUrl = `${originUrl}/donation/callback?gateway=paypal`;
      const cancelUrl = `${originUrl}/donation/callback?gateway=paypal&status=cancelled`;

      const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: numericAmount.toFixed(2),
              },
              description: description ? sanitizeString(String(description), 500) : "Donation to Al-Imran Muslim Aid",
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                return_url: returnUrl,
                cancel_url: cancelUrl,
                user_action: "PAY_NOW",
              },
            },
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        console.error("PayPal create order error:", orderData);
        throw new Error("Failed to create PayPal order");
      }

      // Extract the approval URL from PayPal's response
      const approveLink = orderData.links?.find((l: { rel: string; href: string }) => l.rel === "payer-action" || l.rel === "approve");
      const redirectUrl = approveLink?.href;

      // Save pending donation record
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("donations").insert({
        amount: numericAmount,
        donor_name: donor_name ? sanitizeString(String(donor_name), 255) : null,
        donor_email: donor_email.trim(),
        payment_method: "paypal",
        is_recurring: is_recurring === true,
        status: "pending",
        transaction_id: orderData.id,
        project_id: project_id || null,
      });

      return new Response(
        JSON.stringify({ order_id: orderData.id, redirect_url: redirectUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Capture Order ──
    if (action === "capture-order") {
      const { order_id } = body;

      if (!order_id || typeof order_id !== "string") {
        return new Response(
          JSON.stringify({ error: "order_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const accessToken = await getPayPalAccessToken();

      const captureRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(order_id)}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const captureData = await captureRes.json();
      if (!captureRes.ok) {
        console.error("PayPal capture error:", captureData);
        throw new Error("Failed to capture PayPal payment");
      }

      const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || order_id;

      // Update donation status
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: donation } = await supabase
        .from("donations")
        .update({ status: "completed", transaction_id: captureId })
        .eq("transaction_id", order_id)
        .select()
        .single();

      if (donation) {
        sendNotification("donation", {
          amount: donation.amount,
          donor_name: donation.donor_name,
          donor_email: donation.donor_email,
          payment_method: "paypal",
          is_recurring: donation.is_recurring,
        });
      }

      return new Response(
        JSON.stringify({ status: "completed", transaction_id: captureId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'create-order' or 'capture-order'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PayPal payment error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
