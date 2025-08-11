import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ENSURE-PRICES] ${step}${detailsStr}`);
};

interface WorkflowInput {
  id: string; // local workflow id (e.g., "1")
  name: string; // display name
  amount_cents: number; // price in cents (EUR)
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Supabase client for auth only
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { workflows } = await req.json();
    if (!workflows || !Array.isArray(workflows)) throw new Error("'workflows' array is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const result: Record<string, string> = {};

    for (const wf of workflows as WorkflowInput[]) {
      const lookupKey = `workflow_${wf.id}_eur_monthly_${wf.amount_cents}`;
      logStep("Processing workflow", { id: wf.id, name: wf.name, lookupKey });

      // Try to find existing price by lookup_key
      const existingPrices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        limit: 1,
        expand: ["data.product"],
      } as any);

      if (existingPrices.data.length > 0) {
        const price = existingPrices.data[0];
        logStep("Found existing price", { priceId: price.id, product: (price as any).product?.id || (price as any).product });
        result[wf.id] = price.id;
        continue;
      }

      // Create product
      const product = await stripe.products.create({
        name: wf.name,
        metadata: { workflow_id: wf.id },
      });
      logStep("Created product", { productId: product.id });

      // Create monthly EUR price with lookup_key
      const price = await stripe.prices.create({
        currency: "eur",
        unit_amount: wf.amount_cents,
        recurring: { interval: "month" },
        product: product.id,
        lookup_key: lookupKey,
      });
      logStep("Created price", { priceId: price.id });
      result[wf.id] = price.id;
    }

    return new Response(JSON.stringify({ priceIds: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ensure-prices", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
