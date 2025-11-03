-- Create RLS policies for the knowledge-documents bucket
-- First drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Super admins can access all documents" ON storage.objects;

-- Create new policies
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'knowledge-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM knowledge_bases WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'knowledge-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM knowledge_bases WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'knowledge-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM knowledge_bases WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'knowledge-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM knowledge_bases WHERE created_by = auth.uid()
  )
);

-- Super admins can access all documents
CREATE POLICY "Super admins can access all documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'knowledge-documents'
  AND has_role(auth.uid(), 'super_admin')
);