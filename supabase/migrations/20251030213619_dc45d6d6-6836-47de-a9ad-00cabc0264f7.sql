-- Assign remaining General category packs

-- Business & Strategy for investor relations
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Business & Strategy')
WHERE name = 'Investor Relations Management';

-- Keep these in General as they are truly general purpose
-- Life Productivity Assistant
-- Ultimate Holiday Planner