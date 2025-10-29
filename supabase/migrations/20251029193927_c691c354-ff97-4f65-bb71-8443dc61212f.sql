-- Insert the K-12 IT Staff Prompt Pack
-- Note: Using a placeholder user ID - this will be replaced with actual super admin user ID
DO $$
DECLARE
  pack_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get the first super admin user
  SELECT user_id INTO admin_user_id
  FROM user_roles
  WHERE role = 'super_admin'
  LIMIT 1;

  -- If no super admin found, use a system UUID
  IF admin_user_id IS NULL THEN
    admin_user_id := gen_random_uuid();
  END IF;

  -- Insert the prompt pack
  INSERT INTO public.prompt_packs (name, description, created_by, is_active)
  VALUES (
    'K-12: Prompt Pack for IT Staff (Technology Directors, Coordinators, and Support Teams)',
    'This set of prompts is designed to support K–12 IT staff with everyday tasks like tech support, system communications, policy writing, and data management. Each prompt serves as a flexible template to help you generate clear, user-friendly content, whether you''re crafting a help desk reply, drafting cybersecurity reminders, or documenting device policies. We recommend editing these prompts to reflect your district''s tools, systems, and communication style. Use them as a foundation to save time, reduce repetitive work, and deliver consistent, approachable tech guidance to staff, students, and families.',
    admin_user_id,
    true
  )
  RETURNING id INTO pack_id;

  -- Insert prompt pack items
  INSERT INTO public.prompt_pack_items (pack_id, title, prompt_text, order_index)
  VALUES
    (pack_id, 'Help Desk & Troubleshooting Support 🛠️ 🙋', 'Create a user-friendly help guide for teachers at Greenfield High School on how to connect student Chromebooks to the school Wi-Fi network. Include screenshots, simple language, and common troubleshooting tips.', 1),
    (pack_id, 'Help Desk & Troubleshooting Support 🛠️ 🙋', 'Write a response to a support ticket from a teacher unable to access the district''s learning management system. Include step-by-step guidance and a friendly tone.', 2),
    (pack_id, 'Cybersecurity Awareness 🔐 ⚠️', 'Draft a short reminder email to all staff about best practices for avoiding phishing attacks, especially during state testing season. Include 3–5 bullet points with examples.', 3),
    (pack_id, 'Cybersecurity Awareness 🔐 ⚠️', 'Compose an announcement for students and families about a recent district-wide password reset. Explain why it''s happening, how to reset passwords, and how to contact tech support.', 4),
    (pack_id, 'Technical Documentation & Policy Writing 📄 🖋️', 'Write a one-page Acceptable Use Policy (AUP) for middle school students using school-issued devices. Include sections on appropriate use, data privacy, and consequences for misuse.', 5),
    (pack_id, 'Technical Documentation & Policy Writing 📄 🖋️', 'Summarise the key points of the district''s data privacy policy for a staff-facing FAQ. Keep it clear and concise, and address common teacher concerns.', 6),
    (pack_id, 'System Updates & Communication 🔄 📢', 'Draft a notice to all school staff about an upcoming scheduled maintenance window for the grading system. Include the date, time, expected impact, and contact info for questions.', 7),
    (pack_id, 'System Updates & Communication 🔄 📢', 'Write an all-call message script for the principal to use in notifying families about a temporary outage of the school''s online portal. Include alternate access instructions and expected resolution time.', 8),
    (pack_id, 'Data Management & Reporting 📊 🗂️', 'Generate a checklist for school registrars to verify data accuracy before uploading student enrolment records to the state database. Include steps for checking duplicates, demographic fields, and enrolment dates.', 9),
    (pack_id, 'Data Management & Reporting 📊 🗂️', 'Write a query or formula for identifying students with more than 10 absences in a Google Sheet. Provide an explanation of how it works for school data managers.', 10);
END $$;