-- Remove provider_id requirement from marketplace_items
-- Prompts should be provider-agnostic and work with any LLM
ALTER TABLE public.marketplace_items
ALTER COLUMN provider_id DROP NOT NULL;

-- Update existing items to have null provider_id if needed
UPDATE public.marketplace_items
SET provider_id = NULL
WHERE provider_id IS NOT NULL;