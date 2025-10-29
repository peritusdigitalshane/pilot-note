-- Create prompt_packs table
CREATE TABLE public.prompt_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  install_count INTEGER NOT NULL DEFAULT 0
);

-- Create prompt_pack_items table (individual prompts within a pack)
CREATE TABLE public.prompt_pack_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES public.prompt_packs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_installed_packs table (track which users installed which packs)
CREATE TABLE public.user_installed_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_id UUID NOT NULL REFERENCES public.prompt_packs(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, pack_id)
);

-- Enable RLS
ALTER TABLE public.prompt_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_pack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_installed_packs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt_packs
CREATE POLICY "Users can view active prompt packs"
  ON public.prompt_packs
  FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage prompt packs"
  ON public.prompt_packs
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for prompt_pack_items
CREATE POLICY "Users can view items of active packs"
  ON public.prompt_pack_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.prompt_packs
    WHERE id = prompt_pack_items.pack_id
    AND is_active = true
  ) AND auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage prompt pack items"
  ON public.prompt_pack_items
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_installed_packs
CREATE POLICY "Users can view own installations"
  ON public.user_installed_packs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can install packs"
  ON public.user_installed_packs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can uninstall packs"
  ON public.user_installed_packs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update install_count
CREATE OR REPLACE FUNCTION public.update_pack_install_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prompt_packs
    SET install_count = install_count + 1
    WHERE id = NEW.pack_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prompt_packs
    SET install_count = GREATEST(install_count - 1, 0)
    WHERE id = OLD.pack_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_pack_install_count_trigger
AFTER INSERT OR DELETE ON public.user_installed_packs
FOR EACH ROW
EXECUTE FUNCTION public.update_pack_install_count();

-- Create trigger for updated_at
CREATE TRIGGER update_prompt_packs_updated_at
BEFORE UPDATE ON public.prompt_packs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();