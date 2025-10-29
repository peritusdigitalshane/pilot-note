-- Fix RLS policies to use user_roles table instead of profiles.role

-- Update llm_providers policies
DROP POLICY IF EXISTS "Super admins can manage providers" ON public.llm_providers;
CREATE POLICY "Super admins can manage providers" 
ON public.llm_providers 
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Update fullpilot_models policies
DROP POLICY IF EXISTS "Super admins can manage models" ON public.fullpilot_models;
CREATE POLICY "Super admins can manage models" 
ON public.fullpilot_models 
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Update knowledge_bases policies
DROP POLICY IF EXISTS "Super admins can manage knowledge bases" ON public.knowledge_bases;
CREATE POLICY "Super admins can manage knowledge bases" 
ON public.knowledge_bases 
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));