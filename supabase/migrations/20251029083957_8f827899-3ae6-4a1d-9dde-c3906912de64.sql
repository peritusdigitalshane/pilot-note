-- Create user_models table to track which models users have installed
CREATE TABLE public.user_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  model_id UUID NOT NULL REFERENCES public.fullpilot_models(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, model_id)
);

-- Enable RLS
ALTER TABLE public.user_models ENABLE ROW LEVEL SECURITY;

-- Users can view their own installed models
CREATE POLICY "Users can view own models"
  ON public.user_models FOR SELECT
  USING (auth.uid() = user_id);

-- Users can install models
CREATE POLICY "Users can install models"
  ON public.user_models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can uninstall models
CREATE POLICY "Users can uninstall models"
  ON public.user_models FOR DELETE
  USING (auth.uid() = user_id);