import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[list-active-users] ${step}`, details ?? "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Verify superadmin role
    const { data: roles, error: rolesError } = await supabaseService
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    if (rolesError) throw new Error(`Error fetching roles: ${rolesError.message}`);
    const isSuperadmin = (roles || []).some((r: any) => r.role === "superadmin");
    if (!isSuperadmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Parse body flags (e.g., includePrices) to avoid heavy Stripe calls by default
    let includePrices = false;
    try {
      if (req.method !== "GET") {
        const body = await req.json();
        includePrices = Boolean((body as any)?.includePrices);
      }
    } catch (_) {
      // no body provided – keep defaults
    }

    // Fetch profiles, subscribers, and agents
    const [{ data: profiles, error: profilesError }, { data: subscribers, error: subsError }, { data: agents, error: agentsError }] = await Promise.all([
      supabaseService.from("profiles").select("user_id, email, full_name"),
      supabaseService.from("subscribers").select("user_id, subscribed, stripe_customer_id"),
      supabaseService.from("ai_agents").select("user_id, status"),
    ]);

    if (profilesError) throw new Error(`Error fetching profiles: ${profilesError.message}`);
    if (subsError) throw new Error(`Error fetching subscribers: ${subsError.message}`);
    if (agentsError) throw new Error(`Error fetching agents: ${agentsError.message}`);

    const activeCounts = new Map<string, number>();
    (agents || []).forEach((a: any) => {
      if (a.status === "active") {
        activeCounts.set(a.user_id, (activeCounts.get(a.user_id) || 0) + 1);
      }
    });

    const subsByUser = new Map<string, { subscribed: boolean; stripe_customer_id: string | null }>();
    (subscribers || []).forEach((s: any) => subsByUser.set(s.user_id, { subscribed: !!s.subscribed, stripe_customer_id: s.stripe_customer_id }));

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: "2023-10-16" }) : null;

    const results: Array<{ user_id: string; full_name: string | null; email: string; workflows_active: number; price_monthly_cents: number; currency: string | null }> = [];

    // Prepare price map limited to avoid Stripe rate limits
    const priceByCustomer = new Map<string, { amount: number; currency: string }>();
    if (includePrices && stripe) {
      const customers: string[] = (subscribers || [])
        .filter((s: any) => s.subscribed && s.stripe_customer_id)
        .map((s: any) => s.stripe_customer_id as string);

      const limited = customers.slice(0, 10); // limit external calls to avoid timeouts
      const pricePromises = limited.map(async (customerId) => {
        try {
          const subs = await stripe!.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
          const item = subs.data[0]?.items.data[0];
          if (item?.price?.unit_amount != null) {
            priceByCustomer.set(customerId, {
              amount: item.price.unit_amount!,
              currency: item.price.currency || "usd",
            });
          }
        } catch (e) {
          log("Stripe fetch error", e);
        }
      });
      await Promise.allSettled(pricePromises);
    }

    const subsByUser = new Map<string, { subscribed: boolean; stripe_customer_id: string | null }>();
    (subscribers || []).forEach((s: any) =>
      subsByUser.set(s.user_id, { subscribed: !!s.subscribed, stripe_customer_id: s.stripe_customer_id })
    );

    for (const p of profiles || []) {
      const userId = p.user_id as string;
      const workflowsActive = activeCounts.get(userId) || 0;
      const sub = subsByUser.get(userId);
      const customerId = sub?.stripe_customer_id || null;
      const priceInfo = customerId ? priceByCustomer.get(customerId) : undefined;

      results.push({
        user_id: userId,
        full_name: (p.full_name as string) ?? null,
        email: p.email as string,
        workflows_active: workflowsActive,
        price_monthly_cents: priceInfo?.amount ?? 0,
        currency: priceInfo?.currency ?? null,
      });
    }

    return new Response(JSON.stringify({ users: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    log("ERROR", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
