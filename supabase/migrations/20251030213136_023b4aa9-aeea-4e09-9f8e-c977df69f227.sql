-- Assign prompt packs to appropriate categories

-- Software Development category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Software Development' LIMIT 1)
WHERE name IN (
  'Agile & Scrum Practices',
  'API Design & Documentation',
  'Code Review Excellence',
  'Cloud Architecture Design',
  'Data Pipeline Engineering',
  'Database Schema Design',
  'DevOps & CI/CD Excellence',
  'Frontend Performance Optimisation',
  'Mobile App Security Guidelines',
  'React Component Architecture',
  'RESTful API Best Practices',
  'Software Testing Strategies',
  'Technical Documentation Standards',
  'UI/UX Best Practices',
  'Microservices Architecture'
);

-- Business & Strategy category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Business & Strategy' LIMIT 1)
WHERE name IN (
  'Business Analysis Techniques',
  'Change Management Protocols',
  'Customer Success Management',
  'Product Management Excellence',
  'Strategic Planning Framework',
  'Stakeholder Management'
);

-- Finance & Accounting category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Finance & Accounting' LIMIT 1)
WHERE name IN (
  'Accounting Standards Practice',
  'CFO Financial Leadership',
  'Financial Analysis & Reporting',
  'Tax Compliance & Planning'
);

-- Legal & Compliance category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Legal & Compliance' LIMIT 1)
WHERE name IN (
  'Contract Review & Negotiation',
  'Cybersecurity Audit Protocols',
  'Data Protection & Privacy',
  'Financial Services Regulations',
  'Healthcare Compliance Standards',
  'Legal Services Delivery',
  'Workplace Safety Regulations'
);

-- Marketing & Sales category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Marketing & Sales' LIMIT 1)
WHERE name IN (
  'Brand Strategy Development',
  'Content Strategy Development',
  'Digital Marketing Excellence',
  'E-commerce Platform Strategy',
  'Email Marketing Campaigns',
  'Marketing Analytics Dashboard',
  'Sales Process Optimisation',
  'SEO & Content Marketing',
  'Social Media Management'
);

-- Human Resources category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Human Resources' LIMIT 1)
WHERE name IN (
  'Employee Performance Management',
  'HR & Talent Acquisition',
  'Learning & Development Programs',
  'Organisational Development',
  'Workplace Diversity & Inclusion'
);

-- Healthcare category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Healthcare' LIMIT 1)
WHERE name IN (
  'Medical Practice Management',
  'Patient Care Coordination',
  'Telehealth Implementation'
);

-- Education category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Education' LIMIT 1)
WHERE name IN (
  'Education Curriculum Design',
  'High School Student Success Pack',
  'K-12 IT Support Pack',
  'Online Learning Design',
  'Student Assessment Methods',
  'University Study Skills Pack'
);

-- Property & Construction category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Property & Construction' LIMIT 1)
WHERE name IN (
  'Construction & Building',
  'Landscaping & Garden Design',
  'Property Management Systems',
  'Real Estate Agent Excellence'
);

-- Executive Leadership category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Executive Leadership' LIMIT 1)
WHERE name IN (
  'CEO Strategic Leadership',
  'CFO Financial Leadership',
  'Executive Assistant Excellence'
);

-- Administration category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Administration' LIMIT 1)
WHERE name IN (
  'Office Administration'
);

-- Design & Creative category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Design & Creative' LIMIT 1)
WHERE name IN (
  'Graphic Design Principles',
  'UI/UX Design Systems',
  'Video Production Workflow'
);

-- Project Management category
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'Project Management' LIMIT 1)
WHERE name IN (
  'Agile Project Management',
  'Crisis Communication Plans',
  'Event Planning & Coordination',
  'Grant Writing Excellence',
  'Infrastructure Project Management',
  'IT Project Governance',
  'Procurement Management',
  'Quality Assurance Processes',
  'Risk Management Framework',
  'Supply Chain Optimisation'
);

-- General category for miscellaneous packs
UPDATE prompt_packs SET category_id = (SELECT id FROM categories WHERE name = 'General' LIMIT 1)
WHERE name IN (
  'Investor Relations Management'
) OR category_id IS NULL;