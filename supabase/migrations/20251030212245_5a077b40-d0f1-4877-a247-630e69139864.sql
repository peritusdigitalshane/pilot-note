-- Construction Pack - Remaining 5 prompts (6-10)
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Material Cost Optimisation', 'Analyse current material procurement processes and costs for [PROJECT_TYPE]. Review supplier contracts, bulk purchasing opportunities, and waste reduction strategies. Calculate potential savings from optimised ordering schedules and supplier negotiations. Provide detailed recommendations for reducing material costs by 15-20% while maintaining quality standards. Include specific supplier alternatives, volume discount opportunities, and waste minimisation techniques.', 6
FROM prompt_packs WHERE name = 'Construction & Building';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Subcontractor Performance Review', 'Create a comprehensive performance evaluation framework for subcontractors working on [PROJECT_NAME]. Include metrics for quality of work, timeliness, safety compliance, communication effectiveness, and cost management. Develop scoring criteria and rating scales. Design feedback mechanisms and improvement plans for underperforming contractors. Include template contracts with performance-based incentives and penalty clauses.', 7
FROM prompt_packs WHERE name = 'Construction & Building';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Construction Site Safety Audit', 'Conduct a thorough safety audit for [SITE_LOCATION] covering all WorkSafe requirements and industry best practices. Identify potential hazards including fall risks, equipment safety, electrical hazards, and material handling. Assess current safety procedures, signage, PPE compliance, and emergency response protocols. Generate a detailed report with priority-ranked recommendations, cost estimates for improvements, and implementation timeline. Include training requirements and documentation updates.', 8
FROM prompt_packs WHERE name = 'Construction & Building';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Building Defects Assessment Report', 'Prepare a comprehensive defects assessment for [PROPERTY_ADDRESS] covering structural, waterproofing, and finishing issues. Document each defect with detailed descriptions, photographic evidence requirements, and severity classifications. Assess compliance with Building Code of Australia and relevant Australian Standards. Provide rectification recommendations with cost estimates, responsible parties, and priority rankings. Include warranty implications and dispute resolution pathways.', 9
FROM prompt_packs WHERE name = 'Construction & Building';

INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Construction Cash Flow Projection', 'Develop a detailed 12-month cash flow projection for [CONSTRUCTION_BUSINESS] including all revenue streams and expense categories. Account for seasonal variations, payment terms, retention amounts, and progress payment schedules. Model different scenarios including project delays, cost overruns, and new project acquisitions. Identify potential cash flow gaps and recommend financing solutions. Include working capital requirements, supplier payment strategies, and strategies for improving cash conversion cycle.', 10
FROM prompt_packs WHERE name = 'Construction & Building';