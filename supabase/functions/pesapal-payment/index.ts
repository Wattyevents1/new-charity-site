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

async function getTransactionStatus(token: string, orderTrackingId: string) {
  const statusRes = await fetchWithTimeout(
    `${PESAPAL_TX_STATUS_URL}?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return await statusRes.json();
}

function getSupabaseClient() {
  // Dynamic import not needed - use fetch-based approach
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return { supabaseUrl, supabaseKey };
}

// Simple in-memory rate limiter (per-instance, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function sanitizeString(str: string, maxLen: number): string {
  return str.replace(/[<>"'`;]/g, "").trim().slice(0, maxLen);
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

async function updateDonationStatus(merchantRef: string, status: string, transactionId?: string) {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const updateData: Record<string, string> = { status };
  if (transactionId) updateData.transaction_id = transactionId;

  const { data } = await supabase
    .from("donations")
    .update(updateData)
    .eq("transaction_id", merchantRef)
    .select()
    .single();

  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ── IPN callback handler (GET from Pesapal) ──
    if (action === "ipn") {
      const orderTrackingId = url.searchParams.get("OrderTrackingId");
      const orderMerchantReference = url.searchParams.get("OrderMerchantReference");
      console.log("IPN received:", { orderTrackingId, orderMerchantReference });

      if (orderTrackingId && orderMerchantReference) {
        try {
          const token = await getAccessToken();
          const statusData = await getTransactionStatus(token, orderTrackingId);
          console.log("Transaction status from IPN:", statusData);

          const pesapalStatus = (statusData.payment_status_description || "").toLowerCase();

          if (pesapalStatus === "completed") {
            const donation = await updateDonationStatus(orderMerchantReference, "completed");
            if (donation) {
              sendNotification("donation", {
                amount: donation.amount,
                donor_name: donation.donor_name,
                donor_email: donation.donor_email,
                payment_method: "pesapal",
                is_recurring: donation.is_recurring,
              });
            }
          } else if (pesapalStatus === "failed" || pesapalStatus === "invalid") {
            await updateDonationStatus(orderMerchantReference, "failed");
          } else if (pesapalStatus === "reversed") {
            await updateDonationStatus(orderMerchantReference, "refunded");
          }
          // "pending" status - leave as is
        } catch (err) {
          console.error("IPN processing error:", err);
        }
      }

      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── POST actions ──
    if (req.method === "POST") {
      const body = await req.json();

      // ── Check transaction status (called from frontend callback page) ──
      if (body.action === "check-status") {
        const { order_tracking_id, merchant_reference } = body;
        
        if (!order_tracking_id) {
          return new Response(
            JSON.stringify({ error: "order_tracking_id required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const token = await getAccessToken();
        const statusData = await getTransactionStatus(token, order_tracking_id);
        console.log("Status check result:", statusData);

        const pesapalStatus = (statusData.payment_status_description || "").toLowerCase();
        let mappedStatus = "pending";

        if (pesapalStatus === "completed") {
          mappedStatus = "completed";
          if (merchant_reference) {
            await updateDonationStatus(merchant_reference, "completed");
          }
        } else if (pesapalStatus === "failed" || pesapalStatus === "invalid") {
          mappedStatus = "failed";
          if (merchant_reference) {
            await updateDonationStatus(merchant_reference, "failed");
          }
        }

        return new Response(
          JSON.stringify({
            status: mappedStatus,
            transaction_id: statusData.payment_account || merchant_reference,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ── Submit order ──
      const { amount, donor_name, donor_email, donor_phone, description, merchant_reference, callback_url, is_recurring, project_id } = body;

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

      if (isRateLimited(donor_email)) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const safeDonorName = donor_name ? sanitizeString(String(donor_name), 255) : null;
      const safeDonorPhone = donor_phone ? sanitizeString(String(donor_phone), 20) : "";
      const safeDescription = description ? sanitizeString(String(description), 500) : "Donation";

      const token = await getAccessToken();

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const ipnCallbackUrl = `${supabaseUrl}/functions/v1/pesapal-payment?action=ipn`;
      const ipnId = await registerIPN(token, ipnCallbackUrl);

      const orderId = merchant_reference || crypto.randomUUID();

      // Build the callback URL that Pesapal redirects the user to after payment
      const originUrl = callback_url || new URL(req.headers.get("origin") || req.url).origin;
      const pesapalCallbackUrl = `${originUrl}/donation/callback?gateway=pesapal&OrderMerchantReference=${encodeURIComponent(orderId)}`;

      const orderPayload = {
        id: orderId,
        currency: "USD",
        amount: numericAmount,
        description: safeDescription,
        callback_url: pesapalCallbackUrl,
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
        transaction_id: orderId,
        project_id: project_id || null,
      });

      return new Response(
        JSON.stringify({
          redirect_url: orderData.redirect_url,
          order_tracking_id: orderData.order_tracking_id,
          merchant_reference: orderId,
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
