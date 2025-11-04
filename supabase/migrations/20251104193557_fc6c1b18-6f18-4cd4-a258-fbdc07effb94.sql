-- Enable RLS on system_metadata table
ALTER TABLE public.system_metadata ENABLE ROW LEVEL SECURITY;

-- Allow super admins to manage system metadata
CREATE POLICY "Super admins can manage system metadata"
ON public.system_metadata
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Allow authenticated users to read system metadata (for base model ID lookup)
CREATE POLICY "Authenticated users can read system metadata"
ON public.system_metadata
FOR SELECT
TO authenticated
USING (true);