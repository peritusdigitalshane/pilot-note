-- Drop and recreate the match_chat_documents function with correct vector type from public schema
DROP FUNCTION IF EXISTS public.match_chat_documents(vector, uuid, double precision, integer);
DROP FUNCTION IF EXISTS public.match_chat_documents(extensions.vector, uuid, double precision, integer);

CREATE FUNCTION public.match_chat_documents(
  query_embedding vector(1536),
  conv_id uuid,
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 5
)
RETURNS TABLE(id uuid, title text, content text, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Also fix match_knowledge_documents
DROP FUNCTION IF EXISTS public.match_knowledge_documents(vector, uuid, double precision, integer);
DROP FUNCTION IF EXISTS public.match_knowledge_documents(extensions.vector, uuid, double precision, integer);

CREATE FUNCTION public.match_knowledge_documents(
  query_embedding vector(1536),
  kb_id uuid,
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 5
)
RETURNS TABLE(id uuid, title text, content text, similarity double precision)
LANGUAGE plpgsql
SECURITY DEFINER
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