-- Create categories table for marketplace items
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add category_id to marketplace_items
ALTER TABLE public.marketplace_items
ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Super admins can create categories"
ON public.categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update categories"
ON public.categories
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete categories"
ON public.categories
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

-- Add index for better performance
CREATE INDEX idx_marketplace_items_category_id ON public.marketplace_items(category_id);

-- Insert some default categories
INSERT INTO public.categories (name, description, created_by)
SELECT 
  'Code Assistant', 
  'Prompts for coding, debugging, and software development',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO public.categories (name, description, created_by)
SELECT 
  'Writing & Content', 
  'Prompts for writing, editing, and content creation',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO public.categories (name, description, created_by)
SELECT 
  'Data Analysis', 
  'Prompts for analysing and interpreting data',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO public.categories (name, description, created_by)
SELECT 
  'Customer Support', 
  'Prompts for customer service and support',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO public.categories (name, description, created_by)
SELECT 
  'General', 
  'General purpose prompts',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);