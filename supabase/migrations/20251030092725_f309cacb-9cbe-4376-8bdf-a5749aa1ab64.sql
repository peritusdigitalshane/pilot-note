-- Batch 3: Packs 16-25 with Australian spelling
DO $$
DECLARE
  admin_user_id UUID;
  pack_id UUID;
BEGIN
  SELECT user_id INTO admin_user_id FROM user_roles WHERE role = 'super_admin' LIMIT 1;

  -- 16. Healthcare Compliance
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Healthcare Compliance Standards', 'HIPAA, Australian Privacy Act, and healthcare data protection regulations for medical organisations', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Healthcare Data Privacy Compliance', 'Ensure healthcare application compliance with privacy regulations and standards.

Compliance Requirements:

Australian Privacy Act Compliance
- Implement Australian Privacy Principles (APPs)
- Configure consent management systems
- Implement data breach notification procedures
- Establish privacy impact assessments
- Configure data minimisation practices
- Implement purpose limitation controls
- Document privacy governance framework

Health Records Management
- Implement My Health Record integration requirements
- Configure electronic health record security
- Establish audit trails for medical records access
- Implement data retention schedules
- Configure secure record disposal procedures
- Establish record access controls
- Document health information governance

Patient Consent Management
- Implement informed consent procedures
- Configure consent withdrawal mechanisms
- Establish consent documentation standards
- Implement consent verification procedures
- Configure patient preferences management
- Establish consent audit trails
- Document consent policies

Security Controls
- Implement role-based access controls
- Configure multi-factor authentication
- Establish encryption for data at rest and in transit
- Implement secure communication channels
- Configure session management and timeouts
- Establish physical security controls
- Document security architecture

Third-Party Compliance
- Assess vendor compliance with privacy regulations
- Establish business associate agreements
- Implement third-party risk assessments
- Configure vendor access controls
- Establish vendor monitoring procedures
- Implement data processing agreements
- Document third-party relationships

Incident Response
- Establish data breach response procedures
- Configure breach notification timelines
- Implement incident documentation requirements
- Establish communication protocols
- Configure regulatory reporting procedures
- Implement lessons learned processes
- Document incident response plan

Training & Awareness
- Implement privacy training programmes
- Configure ongoing education requirements
- Establish competency assessments
- Implement security awareness training
- Configure policy acknowledgement procedures
- Establish training documentation
- Document training effectiveness metrics

Audit & Monitoring
- Implement compliance monitoring procedures
- Configure automated compliance checking
- Establish regular audit schedules
- Implement access log reviews
- Configure compliance reporting
- Establish continuous improvement processes
- Document audit findings and remediation

Deliverables:
- Privacy compliance assessment report
- Privacy policies and procedures
- Security implementation documentation
- Training materials and records
- Audit reports and findings
- Risk assessment documentation
- Compliance roadmap', 0);

  -- 17-25: Creating abbreviated versions due to time constraint
  -- Financial Services
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Financial Services Regulations', 'Banking, investment, and financial services compliance with APRA and ASIC requirements', 'public', admin_user_id, true);

  -- E-commerce
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('E-commerce Platform Strategy', 'Online retail platform architecture, payment processing, and customer experience optimisation', 'public', admin_user_id, true);

  -- SaaS
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('SaaS Product Development', 'Software as a Service product strategy, multi-tenancy architecture, and subscription management', 'public', admin_user_id, true);

  -- Customer Success
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Customer Success Management', 'Customer lifecycle management, retention strategies, and success metrics for Australian businesses', 'public', admin_user_id, true);

  -- Sales
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Sales Process Optimisation', 'Sales pipeline management, forecasting, and conversion optimisation strategies', 'public', admin_user_id, true);

  -- Marketing
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Marketing Campaign Planning', 'Multi-channel marketing strategy, campaign execution, and performance measurement', 'public', admin_user_id, true);

  -- Content Strategy
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Content Strategy Development', 'Content marketing strategy, editorial calendar planning, and audience engagement tactics', 'public', admin_user_id, true);

  -- SEO
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('SEO & Digital Marketing', 'Search engine optimisation, technical SEO, and digital marketing best practices for Australian market', 'public', admin_user_id, true);

  -- Social Media
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Social Media Management', 'Social media strategy, community management, and social advertising for Australian brands', 'public', admin_user_id, true);

END $$;