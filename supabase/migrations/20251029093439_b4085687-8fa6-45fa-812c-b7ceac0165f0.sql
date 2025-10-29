-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to knowledge_base_documents
ALTER TABLE knowledge_base_documents
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for faster similarity search
CREATE INDEX IF NOT EXISTS knowledge_base_documents_embedding_idx 
ON knowledge_base_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function to search similar documents
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