import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sanitize = (s: string) => s.replace(/[<>"']/g, "").trim();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(status: number, message: string) {
  return json({ error: message }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, data } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    switch (action) {
      // ── Public form submissions ──────────────────────────────
      case "submit_volunteer": {
        const { name, email, phone, area_of_interest, skills, availability } = data || {};
        if (!name || !email) return err(400, "Name and email are required");
        if (!emailRegex.test(email)) return err(400, "Invalid email address");
        if (name.length > 100 || email.length > 255) return err(400, "Input too long");

        const { error } = await supabase.from("volunteers").insert({
          name: sanitize(name).slice(0, 100),
          email: sanitize(email).slice(0, 255),
          phone: phone ? sanitize(phone).slice(0, 20) : null,
          area_of_interest: area_of_interest ? sanitize(area_of_interest).slice(0, 100) : null,
          skills: skills ? sanitize(skills).slice(0, 500) : null,
          availability: availability ? sanitize(availability).slice(0, 50) : null,
        });
        if (error) throw error;
        return json({ success: true });
      }

      case "submit_contact": {
        const { name, email, subject, message } = data || {};
        if (!name || !email || !message) return err(400, "Name, email, and message are required");
        if (!emailRegex.test(email)) return err(400, "Invalid email address");

        const { error } = await supabase.from("contact_submissions").insert({
          name: sanitize(name).slice(0, 100),
          email: sanitize(email).slice(0, 255),
          subject: subject ? sanitize(subject).slice(0, 200) : null,
          message: sanitize(message).slice(0, 2000),
        });
        if (error) throw error;
        return json({ success: true });
      }

      case "submit_item_donation": {
        const { donor_name, donor_email, donor_phone, category, item_description, pickup_location } = data || {};
        if (!donor_name || !donor_email || !item_description) return err(400, "Name, email, and description are required");
        if (!emailRegex.test(donor_email)) return err(400, "Invalid email address");

        const { error } = await supabase.from("item_donations").insert({
          donor_name: sanitize(donor_name).slice(0, 100),
          donor_email: sanitize(donor_email).slice(0, 255),
          donor_phone: donor_phone ? sanitize(donor_phone).slice(0, 20) : null,
          category: category ? sanitize(category).slice(0, 50) : null,
          item_description: sanitize(item_description).slice(0, 1000),
          pickup_location: pickup_location ? sanitize(pickup_location).slice(0, 300) : null,
        });
        if (error) throw error;
        return json({ success: true });
      }

      case "submit_membership": {
        const { donor_email, donor_name, tier } = data || {};
        if (!donor_email || !tier) return err(400, "Email and tier are required");
        if (!emailRegex.test(donor_email)) return err(400, "Invalid email address");
        const validTiers = ["supporter", "partner", "champion"];
        if (!validTiers.includes(tier)) return err(400, "Invalid membership tier");

        const { error } = await supabase.from("memberships").insert({
          donor_email: sanitize(donor_email).slice(0, 255),
          donor_name: donor_name ? sanitize(donor_name).slice(0, 100) : null,
          tier,
          status: "pending",
        });
        if (error) throw error;
        return json({ success: true });
      }

      // ── Public read endpoints ────────────────────────────────
      case "list_published_posts": {
        const { data: posts, error } = await supabase
          .from("blog_posts")
          .select("id, title, excerpt, image_url, author, category, published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false });
        if (error) throw error;
        return json(posts);
      }

      case "list_open_careers": {
        const { data: jobs, error } = await supabase
          .from("careers")
          .select("id, title, description, requirements, location, employment_type")
          .eq("status", "open")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return json(jobs);
      }

      default:
        return err(400, "Invalid action");
    }
  } catch (error) {
    console.error("Public forms error:", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
