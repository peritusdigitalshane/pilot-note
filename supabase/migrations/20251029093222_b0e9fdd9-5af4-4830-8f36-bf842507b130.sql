-- Create storage bucket for knowledge base documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-documents', 'knowledge-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Add file_url column to knowledge_base_documents table
ALTER TABLE knowledge_base_documents
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Create storage policies for knowledge base documents
-- Super admins can upload files
CREATE POLICY "Super admins can upload knowledge documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'knowledge-documents' AND
  has_role(auth.uid(), 'super_admin'::text)
);

-- Super admins can view files
CREATE POLICY "Super admins can view knowledge documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'knowledge-documents' AND
  has_role(auth.uid(), 'super_admin'::text)
);

-- Super admins can delete files
CREATE POLICY "Super admins can delete knowledge documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'knowledge-documents' AND
  has_role(auth.uid(), 'super_admin'::text)
);