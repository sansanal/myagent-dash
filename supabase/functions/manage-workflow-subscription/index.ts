import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MANAGE-WORKFLOW] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { action, price_id } = await req.json();
    if (!action || !price_id) throw new Error("action and price_id are required");
    if (!["activate", "deactivate"].includes(action)) throw new Error("Invalid action. Use 'activate' or 'deactivate'.");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find or create customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    if (customers.data.length === 0) {
      const created = await stripe.customers.create({ email: user.email });
      customerId = created.id;
      logStep("Created Stripe customer", { customerId });
    } else {
      customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });
    }

    // Get existing active subscription (first one)
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    let subscription = subs.data[0] || null;

    if (action === "activate") {
      if (!subscription) {
        // Create subscription with the first workflow item
        subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: price_id, quantity: 1 }],
          // Default behavior: first charge at creation if collection_method is automatic and payment method exists
          // We don't set proration here; for creates it's not applicable
        });
        logStep("Created subscription with item", { subscriptionId: subscription.id, price_id });
      } else {
        // Check if item already exists
        const existingItem = subscription.items.data.find((it) => it.price.id === price_id);
        if (existingItem) {
          logStep("Item already present in subscription", { itemId: existingItem.id });
        } else {
          subscription = await stripe.subscriptions.update(subscription.id, {
            items: [{ price: price_id, quantity: 1 }],
            proration_behavior: "none",
          });
          logStep("Added item to subscription", { subscriptionId: subscription.id, price_id });
        }
      }
    } else if (action === "deactivate") {
      if (!subscription) {
        logStep("No active subscription to modify");
      } else {
        const existingItem = subscription.items.data.find((it) => it.price.id === price_id);
        if (!existingItem) {
          logStep("Item not found in subscription", { price_id });
        } else {
          subscription = await stripe.subscriptions.update(subscription.id, {
            items: [
              {
                id: existingItem.id,
                deleted: true,
              } as any,
            ],
            proration_behavior: "none",
          });
          logStep("Removed item from subscription (no proration)", { itemId: existingItem.id });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: subscription?.id || null,
        items: subscription?.items?.data?.map((it) => ({ id: it.id, price: it.price.id, quantity: it.quantity })) || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR in manage-workflow-subscription", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
