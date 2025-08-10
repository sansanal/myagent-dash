import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-BILLING-SUMMARY] ${step}${detailsStr}`);
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found for this user");
      return new Response(JSON.stringify({
        subscription: null,
        invoices: [],
        customer: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const customer = customers.data[0];
    const customerId = customer.id;
    logStep("Found Stripe customer", { customerId });

    // Subscription info
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 1 });
    let subscriptionSummary: any = null;
    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      const item = sub.items.data[0];
      const price = item.price;
      const unit_amount = price.unit_amount ?? 0;
      const currency = price.currency ?? 'usd';
      const quantity = item.quantity ?? 1;
      subscriptionSummary = {
        id: sub.id,
        status: sub.status,
        unit_amount,
        currency,
        quantity,
        monthly_total: unit_amount * quantity,
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      };
      logStep("Subscription summary prepared", { id: sub.id, quantity, unit_amount });
    }

    // Invoices history (last 12)
    const invoices = await stripe.invoices.list({ customer: customerId, limit: 12 });
    const invoicesMapped = invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      amount_paid: inv.amount_paid,
      amount_due: inv.amount_due,
      currency: inv.currency,
      status: inv.status,
      hosted_invoice_url: inv.hosted_invoice_url,
      created: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      period_end: inv.status_transitions?.paid_at
        ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
        : null,
    }));

    return new Response(JSON.stringify({ subscription: subscriptionSummary, invoices: invoicesMapped, customer: {
      id: customer.id,
      email: customer.email ?? null,
      name: customer.name ?? null,
    } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-billing-summary", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
