-- Add organization support to prompt_packs
ALTER TABLE public.prompt_packs
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';

-- Add constraint to check visibility values for prompt_packs
ALTER TABLE public.prompt_packs
ADD CONSTRAINT prompt_packs_visibility_check 
CHECK (visibility IN ('private', 'public', 'organization'));

-- Add organization support to user_custom_models
ALTER TABLE public.user_custom_models
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';

-- Add constraint to check visibility values for user_custom_models
ALTER TABLE public.user_custom_models
ADD CONSTRAINT user_custom_models_visibility_check 
CHECK (visibility IN ('private', 'public', 'organization'));

-- Update RLS policies for prompt_packs to include organization visibility
DROP POLICY IF EXISTS "Users can view active prompt packs" ON public.prompt_packs;

CREATE POLICY "Users can view accessible prompt packs"
ON public.prompt_packs
FOR SELECT
USING (
  is_active = true 
  AND (
    visibility = 'public'
    OR created_by = auth.uid()
    OR (visibility = 'organization' AND organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ))
  )
);

-- Update RLS policies for user_custom_models to include organization visibility
DROP POLICY IF EXISTS "Users can manage own custom models" ON public.user_custom_models;

CREATE POLICY "Users can view accessible custom models"
ON public.user_custom_models
FOR SELECT
USING (
  is_active = true
  AND (
    user_id = auth.uid()
    OR visibility = 'public'
    OR (visibility = 'organization' AND organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Users can manage own custom models"
ON public.user_custom_models
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);