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

    const { knowledgeBaseId } = await req.json();

    console.log('Batch generating embeddings for KB:', knowledgeBaseId);

    // Get all documents without embeddings
    const { data: documents, error: fetchError } = await supabase
      .from('knowledge_base_documents')
      .select('id, title, content')
      .eq('knowledge_base_id', knowledgeBaseId)
      .is('embedding', null);

    if (fetchError) {
      throw new Error('Failed to fetch documents: ' + fetchError.message);
    }

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No documents need embeddings',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${documents.length} documents without embeddings`);

    // Get OpenAI provider for embeddings
    const { data: provider, error: providerError } = await supabase
      .from('llm_providers')
      .select('api_key, api_url')
      .eq('provider_type', 'openai')
      .maybeSingle();

    if (providerError || !provider?.api_key) {
      throw new Error('OpenAI provider not configured');
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each document
    for (const doc of documents) {
      try {
        console.log(`Processing document: ${doc.title}`);

        // Generate embedding using OpenAI
        const embeddingResponse = await fetch(`${provider.api_url}/embeddings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: doc.content,
          }),
        });

        if (!embeddingResponse.ok) {
          const errorText = await embeddingResponse.text();
          console.error(`OpenAI API error for ${doc.title}:`, errorText);
          errorCount++;
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Store the embedding
        const { error: updateError } = await supabase
          .from('knowledge_base_documents')
          .update({ embedding })
          .eq('id', doc.id);

        if (updateError) {
          console.error(`Error updating ${doc.title}:`, updateError);
          errorCount++;
        } else {
          console.log(`Successfully embedded: ${doc.title}`);
          successCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing ${doc.title}:`, error);
        errorCount++;
      }
    }

    console.log(`Batch complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: successCount + errorCount,
        successCount,
        errorCount,
        message: `Processed ${successCount + errorCount} documents: ${successCount} successful, ${errorCount} failed`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in batch embedding generation:', error);
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
