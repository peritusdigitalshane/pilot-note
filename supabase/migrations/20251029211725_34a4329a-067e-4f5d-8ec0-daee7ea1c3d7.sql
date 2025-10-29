-- Update RLS policies for knowledge_bases to allow user access
DROP POLICY IF EXISTS "Super admins can manage knowledge bases" ON public.knowledge_bases;
DROP POLICY IF EXISTS "Users can view accessible knowledge bases" ON public.knowledge_bases;

-- Super admins can manage all knowledge bases
CREATE POLICY "Super admins can manage all knowledge bases"
ON public.knowledge_bases
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Users can create their own knowledge bases
CREATE POLICY "Users can create own knowledge bases"
ON public.knowledge_bases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can view knowledge bases they created
CREATE POLICY "Users can view own knowledge bases"
ON public.knowledge_bases
FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR has_role(auth.uid(), 'super_admin'));

-- Users can update their own knowledge bases
CREATE POLICY "Users can update own knowledge bases"
ON public.knowledge_bases
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Users can delete their own knowledge bases
CREATE POLICY "Users can delete own knowledge bases"
ON public.knowledge_bases
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Update RLS policies for knowledge_base_documents to allow user access
DROP POLICY IF EXISTS "Super admins can manage documents" ON public.knowledge_base_documents;
DROP POLICY IF EXISTS "Users can view accessible documents" ON public.knowledge_base_documents;

-- Users can create documents in their own knowledge bases
CREATE POLICY "Users can create documents in own knowledge bases"
ON public.knowledge_base_documents
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by 
  AND EXISTS (
    SELECT 1 FROM public.knowledge_bases
    WHERE id = knowledge_base_documents.knowledge_base_id
    AND (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'))
  )
);

-- Users can view documents in knowledge bases they have access to
CREATE POLICY "Users can view accessible documents"
ON public.knowledge_base_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_bases
    WHERE id = knowledge_base_documents.knowledge_base_id
    AND (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'))
  )
);

-- Users can update documents in their own knowledge bases
CREATE POLICY "Users can update own documents"
ON public.knowledge_base_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Users can delete documents in their own knowledge bases
CREATE POLICY "Users can delete own documents"
ON public.knowledge_base_documents
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);