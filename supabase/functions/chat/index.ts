import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modelId, messages } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get model details with provider and knowledge base
    const { data: model, error: modelError } = await supabase
      .from('fullpilot_models')
      .select(`
        *,
        llm_providers!inner (
          api_url,
          api_key,
          provider_type
        ),
        knowledge_bases (
          id,
          name
        )
      `)
      .eq('id', modelId)
      .single();

    if (modelError || !model) {
      console.error('Error fetching model:', modelError);
      return new Response(
        JSON.stringify({ error: 'Model not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context from knowledge base if available
    let kbContext = '';
    if (model.knowledge_bases) {
      const { data: documents } = await supabase
        .from('knowledge_base_documents')
        .select('title, content')
        .eq('knowledge_base_id', model.knowledge_bases.id);

      if (documents && documents.length > 0) {
        kbContext = '\n\nKnowledge Base:\n' + documents.map(
          doc => `### ${doc.title}\n${doc.content}`
        ).join('\n\n');
      }
    }

    const systemPrompt = model.system_prompt + kbContext;
    const provider = model.llm_providers;

    // Call appropriate provider
    if (provider.provider_type === 'openai') {
      const response = await fetch(`${provider.api_url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.model_name,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ message: data.choices[0].message.content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (provider.provider_type === 'anthropic') {
      const response = await fetch(`${provider.api_url}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': provider.api_key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.model_name,
          max_tokens: 4096,
          system: systemPrompt,
          messages: messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anthropic API error:', response.status, errorText);
        return new Response(
          JSON.stringify({ error: `Anthropic API error: ${response.status}` }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ message: data.content[0].text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unsupported provider type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});