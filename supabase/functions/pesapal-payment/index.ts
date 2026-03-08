import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Pesapal live URLs (production mode)
const PESAPAL_AUTH_URL = "https://pay.pesapal.com/v3/api/Auth/RequestToken";
const PESAPAL_SUBMIT_ORDER_URL = "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest";
const PESAPAL_IPN_URL = "https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN";
const PESAPAL_TX_STATUS_URL = "https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus";

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function getAccessToken(): Promise<string> {
  const consumerKey = Deno.env.get("PESAPAL_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("PESAPAL_CONSUMER_SECRET");

  if (!consumerKey || !consumerSecret) {
    throw new Error("Pesapal credentials not configured");
  }

  const res = await fetchWithTimeout(PESAPAL_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Pesapal auth failed: ${JSON.stringify(data)}`);
  }
  return data.token;
}

async function registerIPN(token: string, ipnUrl: string): Promise<string> {
  const res = await fetchWithTimeout(PESAPAL_IPN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: "GET",
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`IPN registration failed: ${JSON.stringify(data)}`);
  }
  return data.ipn_id;
}

// Simple in-memory rate limiter (per-instance, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Validation helpers
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function sanitizeString(str: string, maxLen: number): string {
  return str.replace(/[<>"'`;]/g, "").trim().slice(0, maxLen);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // IPN callback handler
    if (action === "ipn") {
      const orderTrackingId = url.searchParams.get("OrderTrackingId");
      const orderMerchantReference = url.searchParams.get("OrderMerchantReference");
      console.log("IPN received:", { orderTrackingId, orderMerchantReference });

      if (orderTrackingId) {
        const token = await getAccessToken();
        const statusRes = await fetchWithTimeout(
          `${PESAPAL_TX_STATUS_URL}?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const statusData = await statusRes.json();
        console.log("Transaction status:", statusData);

        if (statusData.payment_status_description === "Completed") {
          const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          const supabase = createClient(supabaseUrl, supabaseKey);

          await supabase
            .from("donations")
            .update({ status: "completed" })
            .eq("transaction_id", orderMerchantReference);
        }
      }

      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Submit order
    if (req.method === "POST") {
      const body = await req.json();
      const { amount, donor_name, donor_email, donor_phone, description, merchant_reference, callback_url, is_recurring, project_id } = body;

      // ── Input validation ──
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

      if (project_id && !isValidUUID(project_id)) {
        return new Response(
          JSON.stringify({ error: "Invalid project ID format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ── Rate limiting by email ──
      if (isRateLimited(donor_email)) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Sanitize string inputs
      const safeDonorName = donor_name ? sanitizeString(String(donor_name), 255) : null;
      const safeDonorPhone = donor_phone ? sanitizeString(String(donor_phone), 20) : "";
      const safeDescription = description ? sanitizeString(String(description), 500) : "Donation";

      const token = await getAccessToken();

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const ipnCallbackUrl = `${supabaseUrl}/functions/v1/pesapal-payment?action=ipn`;
      const ipnId = await registerIPN(token, ipnCallbackUrl);

      const orderPayload = {
        id: merchant_reference || crypto.randomUUID(),
        currency: "USD",
        amount: numericAmount,
        description: safeDescription,
        callback_url: callback_url || `${new URL(req.headers.get("origin") || req.url).origin}/`,
        notification_id: ipnId,
        billing_address: {
          email_address: donor_email.trim(),
          phone_number: safeDonorPhone,
          first_name: safeDonorName?.split(" ")[0] || "",
          last_name: safeDonorName?.split(" ").slice(1).join(" ") || "",
        },
      };

      const orderRes = await fetchWithTimeout(PESAPAL_SUBMIT_ORDER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || orderData.error) {
        throw new Error("Payment processing failed. Please try again.");
      }

      // Save donation record
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("donations").insert({
        amount: numericAmount,
        donor_name: safeDonorName,
        donor_email: donor_email.trim(),
        payment_method: "pesapal",
        is_recurring: is_recurring === true,
        status: "pending",
        transaction_id: orderPayload.id,
        project_id: project_id || null,
      });

      return new Response(
        JSON.stringify({
          redirect_url: orderData.redirect_url,
          order_tracking_id: orderData.order_tracking_id,
          merchant_reference: orderPayload.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Pesapal payment error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
