-- Fix security issues from previous migration

-- Drop the function to recreate it with proper search_path
DROP FUNCTION IF EXISTS match_knowledge_documents(vector, uuid, float, int);

-- Recreate function with security definer and proper search_path
CREATE OR REPLACE FUNCTION match_knowledge_documents(
  query_embedding vector(1536),
  kb_id uuid,
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base_documents.id,
    knowledge_base_documents.title,
    knowledge_base_documents.content,
    1 - (knowledge_base_documents.embedding <=> query_embedding) as similarity
  FROM knowledge_base_documents
  WHERE knowledge_base_documents.knowledge_base_id = kb_id
    AND knowledge_base_documents.embedding IS NOT NULL
    AND 1 - (knowledge_base_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Move vector extension to extensions schema if it exists in public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'vector' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER EXTENSION vector SET SCHEMA extensions;
  END IF;
END $$;