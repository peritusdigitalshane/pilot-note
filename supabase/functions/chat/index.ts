import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function streamOpenAIResponse(apiUrl: string, apiKey: string, modelName: string, systemPrompt: string, messages: any[]) {
  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return response.body;
}

async function streamAnthropicResponse(apiUrl: string, apiKey: string, modelName: string, systemPrompt: string, messages: any[]) {
  const response = await fetch(`${apiUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error:', response.status, errorText);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  return response.body;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modelId, messages } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if this is a custom model (starts with "custom-") or marketplace item (starts with "marketplace-")
    const isCustomModel = modelId.startsWith('custom-');
    const isMarketplaceItem = modelId.startsWith('marketplace-');
    
    let actualModelId = modelId;
    if (isCustomModel) {
      actualModelId = modelId.substring(7); // Remove "custom-" prefix
    } else if (isMarketplaceItem) {
      actualModelId = modelId.substring(12); // Remove "marketplace-" prefix
    }

    let model: any;
    let provider: any;

    if (isMarketplaceItem) {
      // Get marketplace item details (provider is optional for marketplace items)
      const { data: marketplaceItem, error: modelError } = await supabase
        .from('marketplace_items')
        .select(`
          *,
          llm_providers (
            api_url,
            api_key,
            provider_type
          ),
          knowledge_bases (
            id,
            name
          )
        `)
        .eq('id', actualModelId)
        .single();

      if (modelError || !marketplaceItem) {
        console.error('Error fetching marketplace item:', modelError);
        return new Response(
          JSON.stringify({ error: 'Marketplace item not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Marketplace items don't require a provider - they're just prompts
      // Users need to create a custom model based on the marketplace prompt to use it
      if (!marketplaceItem.llm_providers) {
        return new Response(
          JSON.stringify({ 
            error: 'This marketplace prompt needs to be used with a custom model. Please create a custom model using this prompt.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      model = marketplaceItem;
      provider = marketplaceItem.llm_providers;
    } else if (isCustomModel) {
      // Get custom model details with provider and knowledge base
      const { data: customModel, error: modelError } = await supabase
        .from('user_custom_models')
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
        .eq('id', actualModelId)
        .single();

      if (modelError || !customModel) {
        console.error('Error fetching custom model:', modelError);
        return new Response(
          JSON.stringify({ error: 'Custom model not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      model = customModel;
      provider = customModel.llm_providers;
    } else {
      // Get admin model details with provider and knowledge base
      const { data: adminModel, error: modelError } = await supabase
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
        .eq('id', actualModelId)
        .single();

      if (modelError || !adminModel) {
        console.error('Error fetching model:', modelError);
        return new Response(
          JSON.stringify({ error: 'Model not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      model = adminModel;
      provider = adminModel.llm_providers;
    }

    // Build context from knowledge base using RAG if available
    let kbContext = '';
    if (model.knowledge_base_id && messages.length > 0) {
      console.log('Performing RAG search for knowledge base:', model.knowledge_base_id);
      
      // Get the latest user message for RAG search
      const latestUserMessage = [...messages].reverse().find(m => m.role === 'user');
      
      if (latestUserMessage) {
        // Get OpenAI provider for embeddings
        const { data: embeddingProvider, error: embeddingError } = await supabase
          .from('llm_providers')
          .select('api_key, api_url')
          .eq('provider_type', 'openai')
          .maybeSingle();

        if (embeddingProvider && !embeddingError) {
          try {
            // Generate query embedding
            const embeddingResponse = await fetch(`${embeddingProvider.api_url}/embeddings`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${embeddingProvider.api_key}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'text-embedding-ada-002',
                input: latestUserMessage.content,
              }),
            });

            if (embeddingResponse.ok) {
              const embeddingData = await embeddingResponse.json();
              const queryEmbedding = embeddingData.data[0].embedding;

              // Search for similar documents
              const { data: documents, error: searchError } = await supabase
                .rpc('match_knowledge_documents', {
                  query_embedding: queryEmbedding,
                  kb_id: model.knowledge_base_id,
                  match_threshold: 0.5,
                  match_count: 3,
                });

              if (!searchError && documents && documents.length > 0) {
                console.log(`Found ${documents.length} relevant documents via RAG`);
                kbContext = '\n\nRelevant Knowledge Base Context:\n' + documents.map(
                  (doc: any) => `### ${doc.title}\n${doc.content}`
                ).join('\n\n');
              }
            }
          } catch (ragError) {
            console.error('RAG search error:', ragError);
            // Continue without RAG context if it fails
          }
        }
      }
    }

    const systemPrompt = model.system_prompt + kbContext;

    // Stream response based on provider type
    let streamBody: ReadableStream<Uint8Array> | null;
    
    if (provider.provider_type === 'openai') {
      streamBody = await streamOpenAIResponse(
        provider.api_url,
        provider.api_key,
        model.model_name,
        systemPrompt,
        messages
      );
    } else if (provider.provider_type === 'anthropic') {
      streamBody = await streamAnthropicResponse(
        provider.api_url,
        provider.api_key,
        model.model_name,
        systemPrompt,
        messages
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported provider type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return streaming response
    return new Response(streamBody, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});