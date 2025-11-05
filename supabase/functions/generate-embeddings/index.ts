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

    const { documentId, isChat } = await req.json();

    if (!documentId) {
      throw new Error('documentId is required');
    }

    console.log('Generating embeddings for document:', documentId);

    // Determine which table to use
    const table = isChat ? 'chat_documents' : 'knowledge_base_documents';

    // Fetch the document
    const { data: document, error: fetchError } = await supabase
      .from(table)
      .select('content')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      throw new Error('Document not found');
    }

    // Get OpenAI provider for embeddings
    const { data: provider, error: providerError } = await supabase
      .from('llm_providers')
      .select('api_key, api_url')
      .eq('provider_type', 'openai')
      .maybeSingle();

    if (providerError || !provider?.api_key) {
      throw new Error('OpenAI provider not configured');
    }

    // Generate embedding using OpenAI
    const embeddingResponse = await fetch(`${provider.api_url}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: document.content,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    console.log('Embedding generated, updating document');

    // Store the embedding
    const { error: updateError } = await supabase
      .from(table)
      .update({ embedding })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
      throw new Error('Failed to store embedding');
    }

    console.log('Embedding stored successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Embedding generated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating embeddings:', error);
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
