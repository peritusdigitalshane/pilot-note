import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    const { fileUrl, documentId } = await req.json();

    if (!fileUrl || !documentId) {
      throw new Error('fileUrl and documentId are required');
    }

    console.log('Downloading file:', fileUrl);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('knowledge-documents')
      .download(fileUrl);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert file to base64 for text extraction
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // For simple text extraction, we'll check if it's a text file
    const fileName = fileUrl.split('/').pop() || '';
    const fileExt = fileName.split('.').pop()?.toLowerCase();

    let extractedText = '';

    if (fileExt === 'txt' || fileExt === 'md') {
      // Plain text files
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(uint8Array);
    } else {
      // For PDF, DOCX, etc., we indicate that advanced parsing is needed
      extractedText = `Document uploaded: ${fileName}\n\nThis ${fileExt?.toUpperCase()} file has been stored. Advanced text extraction will be implemented in a future update.`;
    }

    // Update the document with extracted text
    const { error: updateError } = await supabase
      .from('knowledge_base_documents')
      .update({ content: extractedText })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
      throw new Error(`Failed to update document: ${updateError.message}`);
    }

    console.log('Document parsed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error parsing document:', error);
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
