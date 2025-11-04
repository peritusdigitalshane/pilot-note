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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { query, knowledgeBaseId, matchCount = 5 } = await req.json();

    if (!query || !knowledgeBaseId) {
      throw new Error('query and knowledgeBaseId are required');
    }

    console.log('Searching knowledge base:', knowledgeBaseId, 'with query:', query);

    // Get OpenAI provider for embeddings
    const { data: provider, error: providerError } = await supabase
      .from('llm_providers')
      .select('api_key, api_url')
      .eq('provider_type', 'openai')
      .maybeSingle();

    if (providerError || !provider?.api_key) {
      throw new Error('OpenAI provider not configured');
    }

    // Generate query embedding
    const embeddingResponse = await fetch(`${provider.api_url}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate query embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for similar documents
    const { data: documents, error: searchError } = await supabase
      .rpc('match_knowledge_documents', {
        query_embedding: queryEmbedding,
        kb_id: knowledgeBaseId,
        match_threshold: 0.5,
        match_count: matchCount,
      });

    if (searchError) {
      console.error('Search error:', searchError);
      throw new Error('Failed to search documents');
    }

    console.log('Found', documents?.length || 0, 'matching documents');

    return new Response(
      JSON.stringify({ 
        success: true, 
        documents: documents || [],
        count: documents?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in RAG search:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
