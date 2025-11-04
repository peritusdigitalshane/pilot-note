import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get Stripe secret key from system settings
    const { data: stripeSetting } = await supabaseClient
      .from("system_settings")
      .select("value")
      .eq("key", "stripe_secret_key")
      .single();

    if (!stripeSetting?.value) {
      throw new Error("Stripe not configured");
    }

    const stripeKey = stripeSetting.value;

    // Get pro plan details
    const { data: proPlan } = await supabaseClient
      .from("subscription_plans")
      .select("*")
      .eq("name", "pro")
      .single();

    if (!proPlan) {
      throw new Error("Pro plan not found");
    }

    // Create Stripe checkout session
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "success_url": `${req.headers.get("origin")}/?payment=success`,
        "cancel_url": `${req.headers.get("origin")}/auth?payment=cancelled`,
        "payment_method_types[]": "card",
        "mode": "subscription",
        "client_reference_id": user.id,
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][product_data][name]": "FullPilot Pro",
        "line_items[0][price_data][product_data][description]": "Unlimited access to all features",
        "line_items[0][price_data][recurring][interval]": "month",
        "line_items[0][price_data][unit_amount]": (proPlan.price_cents || 2900).toString(),
        "line_items[0][quantity]": "1",
        "metadata[user_id]": user.id,
        "metadata[plan_id]": proPlan.id,
      }),
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      throw new Error(session.error?.message || "Stripe checkout failed");
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
