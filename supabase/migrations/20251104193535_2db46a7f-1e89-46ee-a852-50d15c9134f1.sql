-- First, ensure we have a base/free model that all users get access to
-- Create a system provider for the base model if it doesn't exist
INSERT INTO llm_providers (id, name, provider_type, api_url, api_key, created_by)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  'System Provider',
  'openai',
  'https://api.openai.com/v1',
  'system',
  '00000000-0000-0000-0000-000000000000'::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM llm_providers WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- Create a base model that all users get automatically
INSERT INTO fullpilot_models (
  id,
  name,
  model_name,
  system_prompt,
  provider_id,
  is_active,
  created_by
)
SELECT
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Base Model',
  'gpt-3.5-turbo',
  'You are a helpful AI assistant. This is the base model with standard capabilities.',
  '00000000-0000-0000-0000-000000000001'::uuid,
  true,
  '00000000-0000-0000-0000-000000000000'::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM fullpilot_models WHERE id = '00000000-0000-0000-0000-000000000002'::uuid
);

-- Update the handle_new_user function to automatically assign the base model
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count INTEGER;
  base_model_id UUID := '00000000-0000-0000-0000-000000000002'::uuid;
BEGIN
  -- Insert profile for the new user
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- If this is the first user, assign super_admin role
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  END IF;
  
  -- Automatically assign the base model to all new users
  INSERT INTO public.user_models (user_id, model_id)
  VALUES (NEW.id, base_model_id)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Add RLS policy to ensure users can only access models they've installed or that are premium (if they're premium)
DROP POLICY IF EXISTS "Users can view active models" ON fullpilot_models;

CREATE POLICY "Users can view installed models"
ON fullpilot_models
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (
    -- User has this model installed
    EXISTS (
      SELECT 1 FROM user_models 
      WHERE user_models.user_id = auth.uid() 
      AND user_models.model_id = fullpilot_models.id
    )
    -- OR user is super admin
    OR has_role(auth.uid(), 'super_admin')
  )
);

-- Create a system_metadata table to track configuration
CREATE TABLE IF NOT EXISTS public.system_metadata (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Store the base model ID for easy reference
INSERT INTO public.system_metadata (key, value)
VALUES ('base_model_id', '"00000000-0000-0000-0000-000000000002"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_models_user_id ON user_models(user_id);
CREATE INDEX IF NOT EXISTS idx_user_models_model_id ON user_models(model_id);