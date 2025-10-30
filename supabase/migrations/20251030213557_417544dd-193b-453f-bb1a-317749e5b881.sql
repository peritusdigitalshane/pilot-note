-- Reassign prompt packs from General to correct categories

-- Software Development
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Software Development')
WHERE name IN (
  'Lovable Issue troubleshooting',
  'Machine Learning Model Development',
  'Mobile App Development Standards',
  'Network Engineer Toolkit',
  'SaaS Product Development',
  'System Integration Patterns',
  'Systems Engineer Toolkit',
  'Technical Documentation Writing',
  'Test Automation Strategy'
);

-- Marketing & Sales
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Marketing & Sales')
WHERE name IN (
  'Marketing Campaign Planning',
  'SEO & Digital Marketing'
);

-- Business & Strategy
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Business & Strategy')
WHERE name IN (
  'Manufacturing Quality Control',
  'Nonprofit Management',
  'Product Management Framework',
  'Sustainability Initiatives'
);

-- Project Management
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Project Management')
WHERE name IN (
  'Project Management Methodologies'
);

-- Property & Construction
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Property & Construction')
WHERE name IN (
  'Real Estate Development',
  'Real Estate Agent Excellence',
  'Construction & Building',
  'Landscaping & Garden Design'
);

-- Education
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Education')
WHERE name IN (
  'K-12: Prompt Pack for IT Staff (Technology Directors, Coordinators, and Support Teams)',
  'Primary School Teacher Assistant',
  'Research Methodology'
);

-- Legal & Compliance
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Legal & Compliance')
WHERE name IN (
  'Legal Document Analysis',
  'Legal Services Delivery'
);

-- Human Resources
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Human Resources')
WHERE name IN (
  'Training & Development Programmes'
);

-- Design & Creative
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Design & Creative')
WHERE name IN (
  'UI Design Systems',
  'UX Research & Testing'
);

-- Executive Leadership
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Executive Leadership')
WHERE name IN (
  'CFO Financial Leadership',
  'CEO Strategic Leadership',
  'Executive Assistant Excellence'
);

-- Administration
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Administration')
WHERE name IN (
  'Office Administration'
);

-- Healthcare
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Healthcare')
WHERE name IN (
  'Medical Practice Management'
);

-- Finance & Accounting (for accounting-related packs)
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Finance & Accounting')
WHERE name LIKE '%Accounting%' OR name LIKE '%Financial%' AND category_id IS NULL;