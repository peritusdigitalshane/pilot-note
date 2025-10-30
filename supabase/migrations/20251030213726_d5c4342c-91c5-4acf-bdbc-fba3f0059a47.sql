-- Create missing industry-specific prompt packs

-- Real Estate Agent Excellence
INSERT INTO prompt_packs (name, description, visibility, created_by, category_id)
SELECT 
  'Real Estate Agent Excellence',
  'Comprehensive prompt pack for real estate agents covering property marketing, listings, client communication, negotiation, market analysis, open home strategies, buyer/seller management, contract handling, property valuations, and CRM management.',
  'public',
  '1c4b4270-f115-4ea2-8087-eb5cbf53f40c',
  (SELECT id FROM categories WHERE name = 'Property & Construction')
WHERE NOT EXISTS (SELECT 1 FROM prompt_packs WHERE name = 'Real Estate Agent Excellence');

-- Accounting Standards Practice
INSERT INTO prompt_packs (name, description, visibility, created_by, category_id)
SELECT 
  'Accounting Standards Practice',
  'Professional accounting prompt pack covering AASB standards, financial statements, reconciliation, tax compliance, audit preparation, bookkeeping, payroll, BAS/IAS reporting, GST compliance, and financial analysis.',
  'public',
  '1c4b4270-f115-4ea2-8087-eb5cbf53f40c',
  (SELECT id FROM categories WHERE name = 'Finance & Accounting')
WHERE NOT EXISTS (SELECT 1 FROM prompt_packs WHERE name = 'Accounting Standards Practice');

-- Legal Services Delivery
INSERT INTO prompt_packs (name, description, visibility, created_by, category_id)
SELECT 
  'Legal Services Delivery',
  'Comprehensive legal practice prompt pack for solicitors covering contract drafting, client advice letters, legal research, case analysis, litigation strategy, discovery, mediation, settlement, compliance, and precedent documentation.',
  'public',
  '1c4b4270-f115-4ea2-8087-eb5cbf53f40c',
  (SELECT id FROM categories WHERE name = 'Legal & Compliance')
WHERE NOT EXISTS (SELECT 1 FROM prompt_packs WHERE name = 'Legal Services Delivery');

-- Medical Practice Management
INSERT INTO prompt_packs (name, description, visibility, created_by, category_id)
SELECT 
  'Medical Practice Management',
  'Professional medical practice prompt pack covering patient consultations, treatment plans, referral letters, medical reports, clinical documentation, diagnostic assessments, practice management, patient communication, billing, and compliance.',
  'public',
  '1c4b4270-f115-4ea2-8087-eb5cbf53f40c',
  (SELECT id FROM categories WHERE name = 'Healthcare')
WHERE NOT EXISTS (SELECT 1 FROM prompt_packs WHERE name = 'Medical Practice Management');

-- Construction & Building
INSERT INTO prompt_packs (name, description, visibility, created_by, category_id)
SELECT 
  'Construction & Building',
  'Comprehensive construction management prompt pack covering project planning, contract administration, site management, safety, quality control, cost estimation, subcontractor coordination, defects assessment, and building compliance.',
  'public',
  '1c4b4270-f115-4ea2-8087-eb5cbf53f40c',
  (SELECT id FROM categories WHERE name = 'Property & Construction')
WHERE NOT EXISTS (SELECT 1 FROM prompt_packs WHERE name = 'Construction & Building');

-- Landscaping & Garden Design
INSERT INTO prompt_packs (name, description, visibility, created_by, category_id)
SELECT 
  'Landscaping & Garden Design',
  'Professional landscaping prompt pack covering garden design, native species selection, water-wise gardens, maintenance contracts, outdoor living spaces, pest management, lawn care, retaining walls, lighting design, and sustainable practices.',
  'public',
  '1c4b4270-f115-4ea2-8087-eb5cbf53f40c',
  (SELECT id FROM categories WHERE name = 'Property & Construction')
WHERE NOT EXISTS (SELECT 1 FROM prompt_packs WHERE name = 'Landscaping & Garden Design');

-- Executive Assistant Excellence
INSERT INTO prompt_packs (name, description, visibility, created_by, category_id)
SELECT 
  'Executive Assistant Excellence',
  'Comprehensive EA prompt pack covering calendar management, board meeting preparation, travel coordination, stakeholder communication, expense management, meeting minutes, executive onboarding, document management, communication screening, and event coordination.',
  'public',
  '1c4b4270-f115-4ea2-8087-eb5cbf53f40c',
  (SELECT id FROM categories WHERE name = 'Executive Leadership')
WHERE NOT EXISTS (SELECT 1 FROM prompt_packs WHERE name = 'Executive Assistant Excellence');

-- CFO Financial Leadership
INSERT INTO prompt_packs (name, description, visibility, created_by, category_id)
SELECT 
  'CFO Financial Leadership',
  'Strategic CFO prompt pack covering financial dashboards, budget development, cash flow forecasting, cost reduction, M&A due diligence, systems implementation, board reporting, working capital optimisation, capital raising, and risk management.',
  'public',
  '1c4b4270-f115-4ea2-8087-eb5cbf53f40c',
  (SELECT id FROM categories WHERE name = 'Executive Leadership')
WHERE NOT EXISTS (SELECT 1 FROM prompt_packs WHERE name = 'CFO Financial Leadership');

-- CEO Strategic Leadership
INSERT INTO prompt_packs (name, description, visibility, created_by, category_id)
SELECT 
  'CEO Strategic Leadership',
  'Executive CEO prompt pack covering strategic planning, leadership development, stakeholder engagement, culture transformation, board management, innovation, M&A strategy, crisis management, performance systems, and succession planning.',
  'public',
  '1c4b4270-f115-4ea2-8087-eb5cbf53f40c',
  (SELECT id FROM categories WHERE name = 'Executive Leadership')
WHERE NOT EXISTS (SELECT 1 FROM prompt_packs WHERE name = 'CEO Strategic Leadership');

-- Office Administration
INSERT INTO prompt_packs (name, description, visibility, created_by, category_id)
SELECT 
  'Office Administration',
  'Professional office admin prompt pack covering supplies inventory, reception, meeting rooms, filing systems, facilities maintenance, mail distribution, events, workspace setup, petty cash, and travel booking.',
  'public',
  '1c4b4270-f115-4ea2-8087-eb5cbf53f40c',
  (SELECT id FROM categories WHERE name = 'Administration')
WHERE NOT EXISTS (SELECT 1 FROM prompt_packs WHERE name = 'Office Administration');