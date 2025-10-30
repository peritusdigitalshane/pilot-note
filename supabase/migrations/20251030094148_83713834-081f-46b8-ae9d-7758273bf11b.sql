-- Complete Pack 2: Code Review Excellence (add 8 more prompts)
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'Security Vulnerability Assessment', 'Conduct a comprehensive security audit of this codebase. Analyse for common vulnerabilities including SQL injection, XSS, CSRF, insecure dependencies, hardcoded secrets, authentication bypasses, and authorisation flaws. For each issue found, provide: 1) Severity rating (Critical/High/Medium/Low), 2) Exact location in code, 3) Potential exploit scenario, 4) Remediation steps with code examples using Australian spelling, 5) Prevention strategies for future development. Include OWASP Top 10 considerations and industry best practises.', 2
FROM prompt_packs WHERE name = 'Code Review Excellence'
UNION ALL
SELECT id, 'Performance Optimisation Review', 'Review this code for performance bottlenecks and optimisation opportunities. Analyse: 1) Time complexity of algorithms, 2) Database query efficiency and N+1 problems, 3) Memory usage and potential leaks, 4) Network request optimisation, 5) Caching opportunities, 6) Bundle size and lazy loading, 7) Render performance in UI components. Provide specific metrics, profiling recommendations, and refactored code examples. Include both micro-optimisations and architectural improvements using Australian spelling conventions.', 3
FROM prompt_packs WHERE name = 'Code Review Excellence'
UNION ALL
SELECT id, 'Code Maintainability Analysis', 'Evaluate this codebase for long-term maintainability. Assess: 1) Code readability and clarity, 2) Documentation quality and completeness, 3) Naming conventions and consistency, 4) Function and class length appropriateness, 5) Cyclomatic complexity, 6) Technical debt indicators, 7) Dependency management, 8) Test coverage and quality. Provide actionable refactoring suggestions with before/after examples, prioritised by impact on maintainability using Australian spelling.', 4
FROM prompt_packs WHERE name = 'Code Review Excellence'
UNION ALL
SELECT id, 'Architecture Pattern Validation', 'Review the architectural patterns and design decisions in this codebase. Evaluate: 1) Adherence to chosen architecture (MVC, MVVM, Clean, etc), 2) Separation of concerns, 3) Dependency injection usage, 4) Interface design and abstraction levels, 5) Module boundaries and coupling, 6) Scalability considerations, 7) SOLID principles application. Identify pattern violations, anti-patterns, and suggest architectural improvements with detailed rationale using Australian spelling.', 5
FROM prompt_packs WHERE name = 'Code Review Excellence'
UNION ALL
SELECT id, 'Error Handling & Resilience Review', 'Analyse error handling and system resilience in this code. Review: 1) Exception handling completeness and appropriateness, 2) Error message clarity and user-friendliness, 3) Logging strategy and coverage, 4) Graceful degradation mechanisms, 5) Retry logic and circuit breakers, 6) Input validation and sanitisation, 7) Edge case handling. Provide examples of robust error handling patterns and identify gaps in current implementation using Australian spelling.', 6
FROM prompt_packs WHERE name = 'Code Review Excellence'
UNION ALL
SELECT id, 'Testing Strategy Assessment', 'Evaluate the testing approach for this codebase. Analyse: 1) Test coverage breadth and depth, 2) Unit test quality and isolation, 3) Integration test effectiveness, 4) E2E test scenarios, 5) Test data management, 6) Mocking strategy, 7) Test maintainability, 8) Testing anti-patterns. Suggest missing test cases, improvements to existing tests, and testing best practises with code examples using Australian spelling.', 7
FROM prompt_packs WHERE name = 'Code Review Excellence'
UNION ALL
SELECT id, 'API Design & Contract Review', 'Review API design and implementation in this code. Evaluate: 1) RESTful principles adherence or GraphQL schema design, 2) Endpoint naming and structure, 3) Request/response formats, 4) Error response consistency, 5) Versioning strategy, 6) Authentication/authorisation implementation, 7) Rate limiting and pagination, 8) Documentation completeness. Provide API design improvements and OpenAPI/GraphQL schema examples using Australian spelling.', 8
FROM prompt_packs WHERE name = 'Code Review Excellence'
UNION ALL
SELECT id, 'Accessibility Compliance Check', 'Audit this codebase for accessibility compliance. Check: 1) WCAG 2.1 AA/AAA compliance, 2) Semantic HTML usage, 3) ARIA attributes correctness, 4) Keyboard navigation support, 5) Screen reader compatibility, 6) Colour contrast ratios, 7) Focus management, 8) Alternative text for media. Identify violations, provide remediation steps with code examples, and suggest accessibility testing tools using Australian spelling.', 9
FROM prompt_packs WHERE name = 'Code Review Excellence'
UNION ALL
SELECT id, 'Code Duplication & Reusability Analysis', 'Identify code duplication and assess reusability opportunities. Analyse: 1) Duplicated logic patterns, 2) Copy-pasted code blocks, 3) Similar functions/components, 4) Opportunities for shared utilities, 5) Component composition possibilities, 6) Higher-order functions/components, 7) Generic implementations. Provide refactoring examples using DRY principles, showing how to extract and reuse common patterns using Australian spelling.', 10
FROM prompt_packs WHERE name = 'Code Review Excellence';