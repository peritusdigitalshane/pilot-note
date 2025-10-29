-- Create user custom models table
CREATE TABLE public.user_custom_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.llm_providers(id) ON DELETE CASCADE,
  knowledge_base_id UUID REFERENCES public.knowledge_bases(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_custom_models ENABLE ROW LEVEL SECURITY;

-- Users can manage their own custom models
CREATE POLICY "Users can manage own custom models"
ON public.user_custom_models
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_custom_models_updated_at
BEFORE UPDATE ON public.user_custom_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_user_custom_models_user_id ON public.user_custom_models(user_id);
CREATE INDEX idx_user_custom_models_active ON public.user_custom_models(is_active) WHERE is_active = true;