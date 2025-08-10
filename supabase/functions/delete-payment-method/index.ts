import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-PAYMENT-METHOD] ${step}${detailsStr}`);
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

    const { payment_method_id } = await req.json();
    if (!payment_method_id) throw new Error("payment_method_id is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) throw new Error("No Stripe customer found for this user");
    const customer = customers.data[0];
    logStep("Found Stripe customer", { customerId: customer.id });

    // Retrieve the payment method to ensure it belongs to the customer
    const pm = await stripe.paymentMethods.retrieve(payment_method_id);
    if (pm.customer && pm.customer !== customer.id) {
      throw new Error("This payment method does not belong to the authenticated customer");
    }

    // Determine if the payment method is the current default
    const currentDefault = customer.invoice_settings?.default_payment_method as string | null | undefined;
    let newDefault: string | null = null;

    if (currentDefault === payment_method_id) {
      // Find another payment method to set as default (if any)
      const otherMethods = await stripe.paymentMethods.list({ customer: customer.id, type: 'card' });
      const fallback = otherMethods.data.find((m) => m.id !== payment_method_id);
      newDefault = fallback ? fallback.id : null;

      await stripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: newDefault },
      });
      logStep("Updated customer default payment method", { newDefault });
    }

    // Detach the payment method
    await stripe.paymentMethods.detach(payment_method_id);
    logStep("Payment method detached", { payment_method_id });

    return new Response(JSON.stringify({ success: true, new_default_payment_method: newDefault }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR in delete-payment-method", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
