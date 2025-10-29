-- First, delete the incorrectly created packs
DELETE FROM prompt_pack_items WHERE pack_id IN (
  SELECT id FROM prompt_packs WHERE created_by IS NULL
);
DELETE FROM prompt_packs WHERE created_by IS NULL;

-- Get the first user and make them super admin if they aren't already
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT user_id INTO first_user_id FROM profiles ORDER BY created_at LIMIT 1;
  
  IF first_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = first_user_id AND role = 'super_admin'
  ) THEN
    INSERT INTO user_roles (user_id, role) VALUES (first_user_id, 'super_admin');
  END IF;
END $$;

-- Now insert prompt packs with Australian spelling
-- Network Engineer Pack
INSERT INTO prompt_packs (id, name, description, visibility, is_active, created_by)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Network Engineer Toolkit',
  'Essential prompts for network engineers to troubleshoot, design, and secure network infrastructure',
  'public',
  true,
  (SELECT user_id FROM profiles ORDER BY created_at LIMIT 1)
);

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
('a1111111-1111-1111-1111-111111111111', 'Network Troubleshooting Assistant', 'Help me troubleshoot a network issue. Ask me about: symptoms, affected devices/users, recent changes, network topology, and error messages. Then provide systematic troubleshooting steps.', 1),
('a1111111-1111-1111-1111-111111111111', 'Security Audit Helper', 'Guide me through a network security audit. Ask about: current security measures, network size, compliance requirements, and known vulnerabilities. Provide a comprehensive security checklist.', 2),
('a1111111-1111-1111-1111-111111111111', 'Configuration Documentation', 'Help me document network configuration. Ask about: device types, network segments, IP addressing scheme, and routing protocols. Generate clear documentation.', 3),
('a1111111-1111-1111-1111-111111111111', 'Network Design Adviser', 'Assist me in designing a network. Ask about: number of users, physical locations, bandwidth requirements, budget constraints, and security needs. Suggest optimal architecture.', 4),
('a1111111-1111-1111-1111-111111111111', 'Incident Response Guide', 'Guide me through network incident response. Ask about: incident type, scope of impact, timeline, and current status. Provide step-by-step response procedures.', 5);

-- Systems Engineer Pack
INSERT INTO prompt_packs (id, name, description, visibility, is_active, created_by)
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  'Systems Engineer Toolkit',
  'Comprehensive prompts for systems engineers covering automation, architecture, and operations',
  'public',
  true,
  (SELECT user_id FROM profiles ORDER BY created_at LIMIT 1)
);

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
('a2222222-2222-2222-2222-222222222222', 'Server Performance Analyser', 'Help me analyse server performance issues. Ask about: CPU/memory/disk usage, application logs, workload patterns, and recent changes. Provide optimisation recommendations.', 1),
('a2222222-2222-2222-2222-222222222222', 'System Architecture Designer', 'Assist me in designing system architecture. Ask about: application requirements, scalability needs, availability targets, technology stack, and budget. Suggest optimal design.', 2),
('a2222222-2222-2222-2222-222222222222', 'Automation Script Helper', 'Help me create automation scripts. Ask about: task to automate, operating system, preferred language, required inputs/outputs, and error handling needs. Generate script with comments.', 3),
('a2222222-2222-2222-2222-222222222222', 'Disaster Recovery Planner', 'Guide me in creating disaster recovery plan. Ask about: critical systems, RTO/RPO requirements, backup strategy, and recovery procedures. Create comprehensive DR plan.', 4),
('a2222222-2222-2222-2222-222222222222', 'Security Hardening Checklist', 'Help me harden system security. Ask about: OS type, services running, user access patterns, and compliance requirements. Provide detailed hardening checklist.', 5);

-- Primary School Pack
INSERT INTO prompt_packs (id, name, description, visibility, is_active, created_by)
VALUES (
  'a3333333-3333-3333-3333-333333333333',
  'Primary School Teacher Assistant',
  'Helpful prompts for primary school teachers to create lessons, activities, and communicate effectively',
  'public',
  true,
  (SELECT user_id FROM profiles ORDER BY created_at LIMIT 1)
);

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
('a3333333-3333-3333-3333-333333333333', 'Lesson Plan Creator', 'Help me create a lesson plan. Ask about: subject, year level, learning objectives, duration, student abilities, and available resources. Generate detailed lesson plan with activities.', 1),
('a3333333-3333-3333-3333-333333333333', 'Student Feedback Generator', 'Help me write constructive student feedback. Ask about: student name, subject area, strengths observed, areas for improvement, and specific examples. Generate positive, encouraging feedback.', 2),
('a3333333-3333-3333-3333-333333333333', 'Educational Activity Ideas', 'Suggest engaging classroom activities. Ask about: subject, topic, year level, class size, time available, and learning goals. Provide creative, age-appropriate activities.', 3),
('a3333333-3333-3333-3333-333333333333', 'Parent Communication Helper', 'Help me draft parent communications. Ask about: purpose (update/concern/celebration), student context, tone preference, and key points. Generate clear, professional message.', 4),
('a3333333-3333-3333-3333-333333333333', 'Educational Game Designer', 'Create educational games for my class. Ask about: subject, learning objective, year level, group size, and available materials. Suggest fun, educational games.', 5);

-- High School Pack
INSERT INTO prompt_packs (id, name, description, visibility, is_active, created_by)
VALUES (
  'a4444444-4444-4444-4444-444444444444',
  'High School Student Success Pack',
  'Essential prompts for high school students covering academics, university prep, and career planning',
  'public',
  true,
  (SELECT user_id FROM profiles ORDER BY created_at LIMIT 1)
);

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
('a4444444-4444-4444-4444-444444444444', 'Assignment Planner', 'Help me plan my assignment. Ask about: subject, assignment type, due date, requirements, current progress, and challenges. Create structured work plan with milestones.', 1),
('a4444444-4444-4444-4444-444444444444', 'Study Guide Creator', 'Help me create a study guide. Ask about: subject, exam date, topics to cover, preferred study style, and time available. Generate comprehensive study guide with practice questions.', 2),
('a4444444-4444-4444-4444-444444444444', 'University Application Helper', 'Assist me with university applications. Ask about: target universities, intended major, achievements, extracurriculars, and essay prompts. Provide guidance on application strategy.', 3),
('a4444444-4444-4444-4444-444444444444', 'Career Exploration Guide', 'Help me explore career options. Ask about: interests, strengths, values, preferred work environment, and education level. Suggest suitable careers with pathways.', 4),
('a4444444-4444-4444-4444-444444444444', 'Research Project Assistant', 'Guide me through my research project. Ask about: topic, research question, sources needed, project requirements, and deadline. Provide structured research approach.', 5);

-- Holiday Planner Pack
INSERT INTO prompt_packs (id, name, description, visibility, is_active, created_by)
VALUES (
  'a5555555-5555-5555-5555-555555555555',
  'Ultimate Holiday Planner',
  'Complete travel planning assistance from itinerary creation to budgeting and activity suggestions',
  'public',
  true,
  (SELECT user_id FROM profiles ORDER BY created_at LIMIT 1)
);

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
('a5555555-5555-5555-5555-555555555555', 'Trip Itinerary Builder', 'Help me plan my trip itinerary. Ask about: destination, number of days, travel dates, interests (culture/adventure/relaxation), budget level, and travel companions. Create day-by-day itinerary.', 1),
('a5555555-5555-5555-5555-555555555555', 'Travel Budget Planner', 'Help me create a travel budget. Ask about: destination, trip duration, accommodation preference, dining style, activities planned, and shopping budget. Provide detailed budget breakdown.', 2),
('a5555555-5555-5555-5555-555555555555', 'Activity Suggester', 'Suggest activities for my trip. Ask about: destination, interests, fitness level, budget, travel group, and any must-see attractions. Provide mix of popular and hidden gems.', 3),
('a5555555-5555-5555-5555-555555555555', 'Packing List Generator', 'Create a packing list for my trip. Ask about: destination, weather, duration, activities planned, accommodation type, and any special needs. Generate comprehensive packing checklist.', 4),
('a5555555-5555-5555-5555-555555555555', 'Local Experience Finder', 'Help me find authentic local experiences. Ask about: destination, culture interests, food preferences, budget, and travel style. Suggest local restaurants, markets, and cultural experiences.', 5);

-- Life Productivity Pack
INSERT INTO prompt_packs (id, name, description, visibility, is_active, created_by)
VALUES (
  'a6666666-6666-6666-6666-666666666666',
  'Life Productivity Assistant',
  'Personal productivity and life organisation prompts for everyday tasks and goals',
  'public',
  true,
  (SELECT user_id FROM profiles ORDER BY created_at LIMIT 1)
);

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
('a6666666-6666-6666-6666-666666666666', 'Goal Setting Coach', 'Help me set and achieve my goals. Ask about: goal area (career/health/personal), timeline, current situation, obstacles, and resources. Create SMART goals with action plan.', 1),
('a6666666-6666-6666-6666-666666666666', 'Daily Routine Optimiser', 'Help me optimise my daily routine. Ask about: wake/sleep times, work schedule, priorities, energy patterns, and current pain points. Suggest improved routine structure.', 2),
('a6666666-6666-6666-6666-666666666666', 'Meal Planning Assistant', 'Help me plan weekly meals. Ask about: dietary restrictions, cooking skill, time available, budget, household size, and cuisine preferences. Create balanced meal plan with shopping list.', 3),
('a6666666-6666-6666-6666-666666666666', 'Home Organisation Helper', 'Guide me in organising a space. Ask about: area to organise, current challenges, storage available, budget, and end goal. Provide step-by-step organisation plan.', 4),
('a6666666-6666-6666-6666-666666666666', 'Financial Planning Guide', 'Help me with personal finance planning. Ask about: income, expenses, savings goals, debt, and financial concerns. Provide budgeting strategy and savings recommendations.', 5);