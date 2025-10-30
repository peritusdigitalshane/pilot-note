-- Add category_id to prompt_packs table
ALTER TABLE prompt_packs ADD COLUMN category_id UUID REFERENCES categories(id);