import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No signature provided");
    }

    // Get Stripe secret key and webhook secret from system settings
    const { data: settings } = await supabaseClient
      .from("system_settings")
      .select("key, value")
      .in("key", ["stripe_secret_key", "stripe_webhook_secret"]);

    if (!settings || settings.length === 0) {
      throw new Error("Stripe not configured");
    }

    const stripeKey = settings.find(s => s.key === "stripe_secret_key")?.value;
    const webhookSecret = settings.find(s => s.key === "stripe_webhook_secret")?.value;

    if (!stripeKey || !webhookSecret) {
      throw new Error("Stripe configuration incomplete");
    }

    const body = await req.text();

    // Verify webhook signature
    const encoder = new TextEncoder();
    const webhookSecretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureParts = signature.split(",");
    const timestamp = signatureParts.find(p => p.startsWith("t="))?.split("=")[1];
    const actualSignature = signatureParts.find(p => p.startsWith("v1="))?.split("=")[1];

    const payload = `${timestamp}.${body}`;
    const expectedSignature = await crypto.subtle.sign(
      "HMAC",
      webhookSecretKey,
      encoder.encode(payload)
    );

    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignatureHex !== actualSignature) {
      console.error("Invalid signature");
      throw new Error("Invalid signature");
    }

    const event = JSON.parse(body);
    console.log("Webhook event:", event.type);

    // Handle checkout session completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;

      if (!userId) {
        console.error("No user_id in session metadata");
        throw new Error("No user_id found");
      }

      console.log("Updating premium status for user:", userId);

      // Update user's premium status
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ is_premium_member: true })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Failed to update profile:", updateError);
        throw updateError;
      }

      console.log("Successfully updated premium status for user:", userId);
    }

    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_id;

      if (userId) {
        console.log("Removing premium status for user:", userId);
        
        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({ is_premium_member: false })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Failed to update profile:", updateError);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});