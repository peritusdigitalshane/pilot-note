-- Create chat_documents table for storing documents uploaded in chat
CREATE TABLE IF NOT EXISTS public.chat_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for chat documents
CREATE POLICY "Users can view their own chat documents"
ON public.chat_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat documents"
ON public.chat_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat documents"
ON public.chat_documents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat documents"
ON public.chat_documents
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS chat_documents_embedding_idx 
ON public.chat_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function to match chat documents
CREATE OR REPLACE FUNCTION public.match_chat_documents(
  query_embedding vector(1536),
  conv_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chat_documents.id,
    chat_documents.title,
    chat_documents.content,
    1 - (chat_documents.embedding <=> query_embedding) as similarity
  FROM chat_documents
  WHERE chat_documents.conversation_id = conv_id
    AND chat_documents.embedding IS NOT NULL
    AND 1 - (chat_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY chat_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create storage bucket for chat documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-documents', 'chat-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for chat documents
CREATE POLICY "Users can upload their own chat documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own chat documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own chat documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);