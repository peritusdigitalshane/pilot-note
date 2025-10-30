-- Pack 9: Agile & Project Management
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Sprint Planning & Backlog Refinement', 'Design effective sprint planning process. Include: 1) User story creation with acceptance criteria, 2) Story point estimation techniques, 3) Sprint goal definition, 4) Capacity planning and velocity tracking, 5) Backlog prioritisation methods (MoSCoW, RICE), 6) Dependencies identification, 7) Sprint commitment strategy, 8) Refinement meeting structure. Provide templates and examples for distributed teams using Australian spelling.', 1
FROM prompt_packs WHERE name = 'Agile & Project Management'
UNION ALL
SELECT id, 'Scrum Ceremonies Optimisation', 'Optimise Scrum ceremonies for effectiveness. Include: 1) Daily standup best practises and common pitfalls, 2) Sprint review demonstration strategies, 3) Retrospective formats and action items, 4) Backlog refinement efficiency, 5) Time-boxing techniques, 6) Remote ceremony facilitation, 7) Stakeholder engagement, 8) Continuous improvement metrics. Provide ceremony agendas and facilitation guides using Australian spelling.', 2
FROM prompt_packs WHERE name = 'Agile & Project Management'
UNION ALL
SELECT id, 'Epic & User Story Writing', 'Write effective epics and user stories. Include: 1) Epic structure and breakdown, 2) User story format (As a... I want... So that...), 3) Acceptance criteria definition (Given/When/Then), 4) Non-functional requirements integration, 5) Story splitting techniques, 6) INVEST criteria validation, 7) Definition of Ready checklist, 8) Story mapping for features. Provide examples and templates using Australian spelling.', 3
FROM prompt_packs WHERE name = 'Agile & Project Management'
UNION ALL
SELECT id, 'Kanban Board Optimisation', 'Design and optimise Kanban workflow. Include: 1) Column structure and workflow states, 2) Work-in-progress (WIP) limits, 3) Ticket lifecycle and transitions, 4) Swimlanes for prioritisation, 5) Cycle time and lead time tracking, 6) Bottleneck identification, 7) Flow efficiency metrics, 8) Continuous improvement based on data. Provide board setup examples for Jira/Trello using Australian spelling.', 4
FROM prompt_packs WHERE name = 'Agile & Project Management'
UNION ALL
SELECT id, 'Release Planning & Roadmapping', 'Create product roadmap and release plan. Include: 1) Strategic themes and objectives, 2) Quarterly or monthly release planning, 3) Feature prioritisation framework, 4) Dependency mapping across teams, 5) Risk assessment and mitigation, 6) Stakeholder communication plan, 7) Release train coordination, 8) Success metrics definition. Provide roadmap templates and planning examples using Australian spelling.', 5
FROM prompt_packs WHERE name = 'Agile & Project Management'
UNION ALL
SELECT id, 'Team Velocity & Metrics Tracking', 'Implement team metrics and velocity tracking. Include: 1) Velocity calculation and trending, 2) Burndown/burnup chart interpretation, 3) Cumulative flow diagrams, 4) Cycle time distribution analysis, 5) Throughput measurement, 6) Predictability metrics, 7) Quality metrics (defect rates, escaped bugs), 8) Avoiding metric gaming. Provide dashboards and reporting examples using Australian spelling.', 6
FROM prompt_packs WHERE name = 'Agile & Project Management'
UNION ALL
SELECT id, 'Stakeholder Management & Communication', 'Design stakeholder management strategy. Include: 1) Stakeholder analysis and mapping, 2) Communication plan by audience, 3) Status reporting cadence and format, 4) Demo preparation and delivery, 5) Managing expectations and scope changes, 6) Escalation procedures, 7) Decision-making frameworks (RACI), 8) Feedback collection and incorporation. Provide communication templates using Australian spelling.', 7
FROM prompt_packs WHERE name = 'Agile & Project Management'
UNION ALL
SELECT id, 'Distributed Team Collaboration', 'Optimise collaboration for distributed teams. Include: 1) Asynchronous communication patterns, 2) Documentation best practises, 3) Timezone overlap optimisation, 4) Virtual ceremony facilitation, 5) Team bonding activities remotely, 6) Tooling for distributed teams, 7) Knowledge sharing mechanisms, 8) Onboarding remote team members. Provide strategies and tool recommendations using Australian spelling.', 8
FROM prompt_packs WHERE name = 'Agile & Project Management'
UNION ALL
SELECT id, 'Technical Debt Management', 'Manage and reduce technical debt. Include: 1) Technical debt identification and cataloging, 2) Debt quantification and impact assessment, 3) Prioritisation framework (urgency vs impact), 4) Allocation of capacity for debt reduction, 5) Boy Scout Rule implementation, 6) Refactoring strategies, 7) Preventing future debt accumulation, 8) Communicating debt to stakeholders. Provide tracking templates using Australian spelling.', 9
FROM prompt_packs WHERE name = 'Agile & Project Management'
UNION ALL
SELECT id, 'Risk Management in Agile', 'Implement risk management in agile projects. Include: 1) Risk identification workshops, 2) Risk probability and impact assessment, 3) Risk mitigation strategies, 4) Spike solutions for technical uncertainty, 5) Continuous risk reassessment, 6) Risk burndown tracking, 7) Contingency planning, 8) Learning from retrospectives. Provide risk registers and management frameworks using Australian spelling.', 10
FROM prompt_packs WHERE name = 'Agile & Project Management';