-- Pack 11: UI/UX Design (10 prompts)
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'User Research & Persona Development', 'Conduct user research and create personas. Include: 1) Research methodology selection (interviews, surveys, observation), 2) User interview script development, 3) Persona template and creation, 4) Empathy mapping, 5) User journey mapping, 6) Pain point identification, 7) Jobs-to-be-done framework, 8) Research synthesis and insights. Provide templates and examples using Australian spelling.', 1
FROM prompt_packs WHERE name = 'UI/UX Design'
UNION ALL
SELECT id, 'Information Architecture & Wireframing', 'Design information architecture and wireframes. Include: 1) Sitemap creation and card sorting, 2) Navigation structure design, 3) Low-fidelity wireframing, 4) Content hierarchy definition, 5) User flow mapping, 6) Mobile-first approach, 7) Accessibility considerations, 8) Wireframe annotation. Provide wireframe examples and IA documentation using Australian spelling.', 2
FROM prompt_packs WHERE name = 'UI/UX Design'
UNION ALL
SELECT id, 'Design System Creation', 'Create comprehensive design system. Include: 1) Colour palette and accessibility, 2) Typography scale and hierarchy, 3) Spacing and grid system, 4) Component library design, 5) Icon system, 6) Motion and animation guidelines, 7) Design tokens, 8) Documentation and governance. Provide Figma/Sketch design system examples using Australian spelling.', 3
FROM prompt_packs WHERE name = 'UI/UX Design'
UNION ALL
SELECT id, 'Prototyping & Interaction Design', 'Create interactive prototypes. Include: 1) Prototyping tool selection, 2) High-fidelity mockup creation, 3) Micro-interactions design, 4) Animation and transition timing, 5) Interactive component states, 6) User flow prototyping, 7) Device-specific considerations, 8) Handoff specifications. Provide prototype examples and interaction documentation using Australian spelling.', 4
FROM prompt_packs WHERE name = 'UI/UX Design'
UNION ALL
SELECT id, 'Usability Testing & Validation', 'Plan and conduct usability testing. Include: 1) Test plan creation, 2) Task scenario development, 3) Participant recruitment, 4) Moderated vs unmoderated testing, 5) Metrics definition (success rate, time on task), 6) A/B testing setup, 7) Findings synthesis, 8) Iteration recommendations. Provide testing scripts and report templates using Australian spelling.', 5
FROM prompt_packs WHERE name = 'UI/UX Design'
UNION ALL
SELECT id, 'Accessibility (WCAG) Compliance', 'Design for accessibility compliance. Include: 1) WCAG 2.1 AA/AAA guidelines, 2) Colour contrast requirements, 3) Keyboard navigation design, 4) Screen reader optimisation, 5) ARIA labels and roles, 6) Focus management, 7) Responsive and adaptable designs, 8) Accessibility testing tools. Provide accessible design patterns using Australian spelling.', 6
FROM prompt_packs WHERE name = 'UI/UX Design'
UNION ALL
SELECT id, 'Mobile App Design Patterns', 'Design mobile applications following platform guidelines. Include: 1) iOS Human Interface Guidelines, 2) Material Design for Android, 3) Navigation patterns (tab bar, drawer), 4) Gesture interactions, 5) Touch target sizing, 6) Responsive layouts for various screens, 7) Dark mode design, 8) App icon and splash screen. Provide mobile UI examples using Australian spelling.', 7
FROM prompt_packs WHERE name = 'UI/UX Design'
UNION ALL
SELECT id, 'Design Handoff & Developer Collaboration', 'Streamline design-to-development handoff. Include: 1) Design specifications documentation, 2) Asset export and organisation, 3) Design system code integration, 4) Component documentation, 5) Responsive breakpoint specification, 6) Animation specifications, 7) Collaboration tools (Zeplin, Figma), 8) QA and design review process. Provide handoff documentation templates using Australian spelling.', 8
FROM prompt_packs WHERE name = 'UI/UX Design'
UNION ALL
SELECT id, 'Responsive & Adaptive Design', 'Design responsive and adaptive layouts. Include: 1) Breakpoint strategy, 2) Fluid typography and spacing, 3) Flexible grid systems, 4) Content reflow patterns, 5) Image and media responsiveness, 6) Progressive enhancement, 7) Mobile-first vs desktop-first, 8) Cross-browser compatibility. Provide responsive design patterns using Australian spelling.', 9
FROM prompt_packs WHERE name = 'UI/UX Design'
UNION ALL
SELECT id, 'Design Metrics & Analytics', 'Define and track design metrics. Include: 1) User engagement metrics, 2) Task completion rates, 3) Error rates and recovery, 4) Net Promoter Score (NPS), 5) Heatmap and session recording analysis, 6) Conversion funnel optimisation, 7) A/B test analysis, 8) Continuous improvement framework. Provide metrics tracking and analysis methods using Australian spelling.', 10
FROM prompt_packs WHERE name = 'UI/UX Design';