import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const ALLOWED_ENTITIES = [
  "volunteers",
  "blog_posts",
  "contact_submissions",
  "careers",
  "item_donations",
  "memberships",
] as const;
type Entity = (typeof ALLOWED_ENTITIES)[number];

const CREATABLE: Entity[] = ["blog_posts", "careers"];
const DELETABLE: Entity[] = ["blog_posts", "careers"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── Authenticate ─────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userId = claimsData.claims.sub as string;

    // ── Authorize (admin / content_manager) ──────────────────
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const roles = (roleData || []).map((r: { role: string }) => r.role);
    const isAdmin = roles.includes("admin");
    const isAdminOrManager = isAdmin || roles.includes("content_manager");

    if (!isAdminOrManager) {
      return json({ error: "Forbidden" }, 403);
    }

    // ── Parse request ────────────────────────────────────────
    const body = await req.json();
    const { action, entity, data, id } = body as {
      action: string;
      entity?: Entity;
      data?: Record<string, unknown>;
      id?: string;
    };

    if (entity && !ALLOWED_ENTITIES.includes(entity)) {
      return json({ error: "Invalid entity" }, 400);
    }

    // ── Route actions ────────────────────────────────────────
    switch (action) {
      case "list": {
        if (!entity) return json({ error: "Entity required" }, 400);
        const { data: rows, error } = await serviceClient
          .from(entity)
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return json(rows);
      }

      case "create": {
        if (!entity || !CREATABLE.includes(entity)) {
          return json({ error: "Create not allowed for this entity" }, 400);
        }
        if (!data) return json({ error: "Data required" }, 400);
        const { error } = await serviceClient.from(entity).insert(data);
        if (error) throw error;
        return json({ success: true });
      }

      case "update": {
        if (!entity) return json({ error: "Entity required" }, 400);
        if (!id) return json({ error: "ID required" }, 400);
        if (!data) return json({ error: "Data required" }, 400);
        const { error } = await serviceClient.from(entity).update(data).eq("id", id);
        if (error) throw error;
        return json({ success: true });
      }

      case "delete": {
        if (!isAdmin) return json({ error: "Admin only" }, 403);
        if (!entity || !DELETABLE.includes(entity)) {
          return json({ error: "Delete not allowed for this entity" }, 400);
        }
        if (!id) return json({ error: "ID required" }, 400);
        const { error } = await serviceClient.from(entity).delete().eq("id", id);
        if (error) throw error;
        return json({ success: true });
      }

      case "dashboard_stats": {
        const [volunteers, contacts, blogPosts, careers, itemDonations, memberships] =
          await Promise.all([
            serviceClient.from("volunteers").select("id", { count: "exact", head: true }),
            serviceClient.from("contact_submissions").select("id", { count: "exact", head: true }),
            serviceClient.from("blog_posts").select("id", { count: "exact", head: true }),
            serviceClient.from("careers").select("id", { count: "exact", head: true }),
            serviceClient.from("item_donations").select("id", { count: "exact", head: true }),
            serviceClient.from("memberships").select("id", { count: "exact", head: true }),
          ]);
        return json({
          volunteers: volunteers.count || 0,
          contacts: contacts.count || 0,
          blogPosts: blogPosts.count || 0,
          careers: careers.count || 0,
          itemDonations: itemDonations.count || 0,
          memberships: memberships.count || 0,
        });
      }

      default:
        return json({ error: "Invalid action" }, 400);
    }
  } catch (error) {
    console.error("Admin API error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});
