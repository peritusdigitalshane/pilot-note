import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiUrl, apiKey, providerType } = await req.json();

    if (!apiUrl || !apiKey || !providerType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let models = [];

    // Fetch models based on provider type
    if (providerType === 'openai') {
      const response = await fetch(`${apiUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        return new Response(
          JSON.stringify({ error: `Failed to fetch models: ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      models = data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        created: model.created,
      }));
    } else if (providerType === 'anthropic') {
      // Anthropic doesn't have a models endpoint, return predefined models
      models = [
        { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5' },
        { id: 'claude-opus-4-1', name: 'Claude Opus 4.1' },
        { id: 'claude-sonnet-4', name: 'Claude Sonnet 4' },
        { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku' },
      ];
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported provider type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ models }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-models function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});