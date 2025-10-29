import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI provider from database
    const { data: provider, error: providerError } = await supabase
      .from('llm_providers')
      .select('api_key')
      .eq('provider_type', 'openai')
      .maybeSingle();

    if (providerError || !provider?.api_key) {
      console.error('Failed to fetch OpenAI provider:', providerError);
      throw new Error('OpenAI provider not configured. Please add an OpenAI provider in Settings.');
    }

    console.log('Creating ephemeral token for realtime API');

    // The model parameter goes in the URL for the sessions endpoint
    const model = "gpt-4o-realtime-preview-2024-12-17";
    const response = await fetch(`https://api.openai.com/v1/realtime/sessions?model=${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${provider.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice: "verse"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Realtime session created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating realtime session:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
