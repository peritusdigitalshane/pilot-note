-- Batches 4 & 5: Packs 26-50 with Australian spelling
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT user_id INTO admin_user_id FROM user_roles WHERE role = 'super_admin' LIMIT 1;

  -- Batch 4: Packs 26-35
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active) VALUES
  ('Legal Document Analysis', 'Legal document review, contract analysis, and compliance verification for Australian legal requirements', 'public', admin_user_id, true),
  ('Contract Review & Negotiation', 'Commercial contract assessment, risk identification, and negotiation strategies for Australian businesses', 'public', admin_user_id, true),
  ('Project Management Methodologies', 'Agile, Waterfall, and hybrid project management approaches aligned with Australian PMI standards', 'public', admin_user_id, true),
  ('Agile & Scrum Practices', 'Sprint planning, retrospectives, and agile transformation for Australian development teams', 'public', admin_user_id, true),
  ('Product Management Framework', 'Product strategy, roadmap planning, and feature prioritisation for Australian product teams', 'public', admin_user_id, true),
  ('UX Research & Testing', 'User research methodologies, usability testing, and user-centred design practices', 'public', admin_user_id, true),
  ('UI Design Systems', 'Component libraries, design tokens, and brand consistency for Australian digital products', 'public', admin_user_id, true),
  ('Brand Strategy Development', 'Brand positioning, messaging, and identity development for Australian market', 'public', admin_user_id, true),
  ('Business Analysis Techniques', 'Requirements gathering, process mapping, and stakeholder management for Australian enterprises', 'public', admin_user_id, true),
  ('Change Management Protocols', 'Organisational change management, communication strategies, and adoption planning', 'public', admin_user_id, true);

  -- Batch 5: Packs 36-50
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active) VALUES
  ('HR & Talent Acquisition', 'Recruitment strategies, candidate assessment, and talent pipeline management for Australian organisations', 'public', admin_user_id, true),
  ('Employee Performance Management', 'Performance reviews, goal setting, and development planning aligned with Fair Work regulations', 'public', admin_user_id, true),
  ('Training & Development Programmes', 'Learning and development initiatives, skills assessment, and training effectiveness measurement', 'public', admin_user_id, true),
  ('Crisis Communication Plans', 'Crisis response protocols, stakeholder communication, and reputation management for Australian organisations', 'public', admin_user_id, true),
  ('Investor Relations Management', 'Shareholder communication, financial reporting, and investor engagement strategies', 'public', admin_user_id, true),
  ('Financial Analysis & Reporting', 'Financial statement analysis, forecasting, and reporting aligned with Australian accounting standards', 'public', admin_user_id, true),
  ('Supply Chain Optimisation', 'Logistics management, inventory optimisation, and supplier relationship management', 'public', admin_user_id, true),
  ('Manufacturing Quality Control', 'Quality assurance processes, defect prevention, and continuous improvement methodologies', 'public', admin_user_id, true),
  ('Real Estate Development', 'Property development planning, feasibility analysis, and project delivery for Australian market', 'public', admin_user_id, true),
  ('Education Curriculum Design', 'Learning outcomes design, curriculum development, and educational assessment strategies', 'public', admin_user_id, true),
  ('Research Methodology', 'Academic research design, data collection methods, and research ethics for Australian institutions', 'public', admin_user_id, true),
  ('Grant Writing Excellence', 'Grant proposal development, budget justification, and funding application strategies', 'public', admin_user_id, true),
  ('Nonprofit Management', 'Charity governance, fundraising strategies, and impact measurement for Australian NFPs', 'public', admin_user_id, true),
  ('Sustainability Initiatives', 'Environmental sustainability planning, carbon reduction, and ESG reporting for Australian organisations', 'public', admin_user_id, true),
  ('Risk Management Framework', 'Enterprise risk assessment, mitigation strategies, and risk governance aligned with AS/NZS ISO 31000', 'public', admin_user_id, true);

END $$;