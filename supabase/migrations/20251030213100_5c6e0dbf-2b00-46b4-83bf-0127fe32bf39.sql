-- Add additional categories for better organisation using existing user
INSERT INTO categories (name, description, created_by)
SELECT 'Software Development', 'Coding, APIs, DevOps, testing, and software engineering practices', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Software Development');

INSERT INTO categories (name, description, created_by)
SELECT 'Business & Strategy', 'Business analysis, strategy, and operational management', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Business & Strategy');

INSERT INTO categories (name, description, created_by)
SELECT 'Finance & Accounting', 'Financial management, accounting, and CFO leadership', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Finance & Accounting');

INSERT INTO categories (name, description, created_by)
SELECT 'Legal & Compliance', 'Legal services, contracts, and regulatory compliance', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Legal & Compliance');

INSERT INTO categories (name, description, created_by)
SELECT 'Marketing & Sales', 'Marketing strategy, content, branding, and sales operations', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Marketing & Sales');

INSERT INTO categories (name, description, created_by)
SELECT 'Human Resources', 'HR, recruitment, talent management, and employee relations', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Human Resources');

INSERT INTO categories (name, description, created_by)
SELECT 'Healthcare', 'Medical services, healthcare compliance, and patient care', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Healthcare');

INSERT INTO categories (name, description, created_by)
SELECT 'Education', 'Curriculum design, student support, and educational technology', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Education');

INSERT INTO categories (name, description, created_by)
SELECT 'Property & Construction', 'Real estate, construction, building, and landscaping services', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Property & Construction');

INSERT INTO categories (name, description, created_by)
SELECT 'Executive Leadership', 'CEO, CFO, executive assistant, and senior management', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Executive Leadership');

INSERT INTO categories (name, description, created_by)
SELECT 'Administration', 'Office administration, operations, and support services', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Administration');

INSERT INTO categories (name, description, created_by)
SELECT 'Design & Creative', 'UI/UX design, creative services, and visual content', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Design & Creative');

INSERT INTO categories (name, description, created_by)
SELECT 'Project Management', 'Project planning, execution, agile, and delivery management', '1c4b4270-f115-4ea2-8087-eb5cbf53f40c'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Project Management');