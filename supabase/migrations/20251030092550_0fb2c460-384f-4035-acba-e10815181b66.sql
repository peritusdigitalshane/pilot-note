-- Final packs for Batch 2: Packs 11-15 with Australian spelling
DO $$
DECLARE
  admin_user_id UUID;
  pack_id UUID;
BEGIN
  SELECT user_id INTO admin_user_id FROM user_roles WHERE role = 'super_admin' LIMIT 1;

  -- 11. Data Pipeline Engineering
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Data Pipeline Engineering', 'Enterprise data pipeline design and implementation for ETL/ELT processes following Australian data standards', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Data Pipeline Architecture Design', 'Design robust data pipeline for reliable data processing and transformation.

Pipeline Design Requirements:

Architecture Selection
- Choose appropriate architecture (batch, streaming, hybrid)
- Evaluate ETL vs ELT approach based on requirements
- Design for scalability and performance
- Plan for data volume growth
- Configure distributed processing if needed
- Design for fault tolerance and reliability
- Document architectural decisions

Data Ingestion Strategy
- Identify all data sources and formats
- Design connector/extractor mechanisms
- Implement incremental vs full load strategies
- Configure change data capture (CDC) if needed
- Implement data validation at source
- Design for schema evolution handling
- Configure monitoring for source systems

Data Transformation Logic
- Design transformation workflows
- Implement data cleaning and standardisation
- Configure data enrichment processes
- Design aggregation and summarisation logic
- Implement data quality rules
- Configure transformation testing
- Document business logic in transformations

Data Quality Management
- Implement data validation rules
- Configure data quality metrics
- Design data profiling procedures
- Implement anomaly detection
- Configure data quality alerts
- Create data quality dashboards
- Document data quality standards

Error Handling & Recovery
- Design comprehensive error handling
- Implement retry logic with backoff
- Configure dead letter queues
- Design data reconciliation processes
- Implement pipeline recovery procedures
- Configure error notification system
- Document troubleshooting procedures

Performance Optimisation
- Implement parallel processing where appropriate
- Optimise data transformation logic
- Configure appropriate batch sizes
- Implement caching strategies
- Optimise database write operations
- Monitor pipeline execution times
- Identify and resolve bottlenecks

Monitoring & Observability
- Implement comprehensive logging
- Configure pipeline execution monitoring
- Track data lineage and provenance
- Monitor data volume and throughput
- Implement alerting for failures
- Create operational dashboards
- Document monitoring procedures

Data Governance
- Implement data cataloguing
- Configure metadata management
- Ensure compliance with privacy regulations
- Implement data retention policies
- Configure access controls
- Document data ownership
- Implement audit trails

Scheduling & Orchestration
- Design workflow orchestration
- Configure scheduling based on requirements
- Implement dependency management
- Design for idempotent operations
- Configure parallel execution where appropriate
- Implement backfill procedures
- Document scheduling logic

Testing Strategy
- Implement unit tests for transformations
- Configure integration testing
- Design data quality tests
- Implement regression testing
- Configure performance testing
- Test failure scenarios
- Document testing procedures

Deliverables:
- Complete pipeline architecture diagram
- Data flow documentation
- Transformation logic specifications
- Data quality rules documented
- Monitoring and alerting configuration
- Error handling procedures
- Operational runbooks', 0);

  -- 12. Cybersecurity Audit Protocols
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Cybersecurity Audit Protocols', 'Comprehensive security audit methodologies aligned with Australian cybersecurity frameworks and standards', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Security Audit Execution Plan', 'Conduct comprehensive cybersecurity audit following industry frameworks.

Audit Methodology:

Scope Definition
- Define audit objectives and success criteria
- Identify systems and applications in scope
- Determine compliance requirements (Essential Eight, NIST, ISO 27001)
- Define audit timeline and milestones
- Identify stakeholders and their responsibilities
- Establish communication protocols
- Document scope boundaries and exclusions

Asset Inventory Assessment
- Catalogue all IT assets and systems
- Document network architecture and topology
- Identify critical systems and data
- Map data flows and integration points
- Document cloud services and third-party integrations
- Identify shadow IT and unauthorised systems
- Create comprehensive asset register

Access Control Review
- Audit user access rights and permissions
- Review privileged access management
- Assess authentication mechanisms
- Evaluate authorisation procedures
- Review service account usage
- Audit shared account practices
- Test access provisioning and deprovisioning processes

Network Security Assessment
- Review firewall configurations and rules
- Assess network segmentation
- Evaluate VPN and remote access security
- Review wireless network security
- Test intrusion detection/prevention systems
- Assess DDoS protection measures
- Review network monitoring capabilities

Vulnerability Assessment
- Conduct automated vulnerability scanning
- Perform manual security testing
- Assess patch management processes
- Review security configuration baselines
- Test for common vulnerabilities (OWASP Top 10)
- Evaluate vulnerability remediation procedures
- Prioritise vulnerabilities by risk

Data Protection Evaluation
- Review data classification practices
- Assess encryption implementation
- Evaluate data backup procedures
- Test data recovery capabilities
- Review data retention policies
- Assess data loss prevention measures
- Evaluate privacy compliance (Australian Privacy Act)

Incident Response Readiness
- Review incident response plans
- Assess incident detection capabilities
- Evaluate incident response procedures
- Test incident escalation processes
- Review forensic capabilities
- Assess business continuity plans
- Conduct tabletop exercises

Security Awareness Assessment
- Review security training programmes
- Assess phishing awareness
- Evaluate security policy communication
- Test user security knowledge
- Review security culture indicators
- Assess security awareness metrics
- Evaluate ongoing education programs

Compliance Verification
- Verify compliance with Essential Eight
- Check adherence to industry regulations
- Review audit logging and retention
- Assess compliance reporting procedures
- Verify security policy documentation
- Review third-party compliance requirements
- Document compliance gaps

Third-Party Risk Management
- Review vendor security assessments
- Evaluate third-party access controls
- Assess supply chain security
- Review vendor contracts for security clauses
- Evaluate vendor monitoring procedures
- Assess business partner security
- Document third-party risks

Deliverables:
- Comprehensive audit report
- Risk assessment matrix
- Prioritised remediation recommendations
- Compliance gap analysis
- Executive summary for leadership
- Detailed technical findings
- Remediation roadmap with timelines', 0);

  -- 13. Technical Documentation Writing
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Technical Documentation Writing', 'Professional technical writing standards for software documentation following Australian documentation practices', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'API Documentation Standards', 'Create comprehensive API documentation for developers.

Documentation Requirements:

Overview Section
- Provide clear API purpose and capabilities
- Describe target audience and use cases
- Outline key features and functionality
- Include getting started quickstart guide
- Document API versioning strategy
- Provide changelog and version history
- Include deprecation notices if applicable

Authentication & Authorisation
- Document authentication methods supported
- Provide step-by-step authentication setup
- Include example authentication requests
- Document token management and refresh
- Explain authorisation scopes and permissions
- Provide security best practices
- Include troubleshooting common auth issues

Endpoint Documentation
- Document each endpoint with HTTP method
- Provide full endpoint URL patterns
- Describe request parameters (path, query, body)
- Specify required vs optional parameters
- Document request body schema with examples
- Provide response schema for all status codes
- Include example requests and responses

Error Handling
- Document all possible error codes
- Provide error message formats
- Explain error troubleshooting steps
- Include examples of error responses
- Document rate limiting errors
- Provide retry recommendations
- Include error recovery best practices

Rate Limiting & Throttling
- Document rate limit policies
- Explain rate limit headers
- Provide guidance on handling rate limits
- Document throttling behaviour
- Include examples of rate limit responses
- Provide recommendations for optimisation
- Document rate limit increase procedures

Code Examples
- Provide examples in multiple languages
- Include copy-paste ready code snippets
- Show complete request/response examples
- Demonstrate common use cases
- Include error handling in examples
- Provide SDK usage examples if available
- Keep examples up-to-date with API changes

SDKs & Client Libraries
- Document available SDKs and versions
- Provide installation instructions
- Include configuration examples
- Document SDK-specific features
- Provide SDK code examples
- Link to SDK source repositories
- Document SDK support and updates

Testing & Sandbox
- Provide sandbox environment access
- Document test data and scenarios
- Include Postman/Insomnia collections
- Provide API testing tools
- Document test account creation
- Include data cleanup procedures
- Provide testing best practices

Performance & Best Practices
- Document performance characteristics
- Provide optimisation recommendations
- Include pagination best practices
- Document batch operation guidance
- Provide caching recommendations
- Include scalability considerations
- Document monitoring recommendations

Versioning & Migration
- Document version support policy
- Provide migration guides between versions
- Include breaking changes documentation
- Document backwards compatibility
- Provide version deprecation timeline
- Include version selection guidance
- Document version-specific features

Deliverables:
- Complete API reference documentation
- Interactive API documentation (Swagger/OpenAPI)
- Getting started tutorials
- Code example repository
- SDK documentation
- Migration guides
- Troubleshooting guide', 0);

  -- 14. System Integration Patterns
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('System Integration Patterns', 'Enterprise integration patterns and best practices for connecting distributed systems following Australian standards', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Enterprise Integration Design', 'Design system integration architecture following integration patterns.

Integration Architecture:

Integration Pattern Selection
- Evaluate point-to-point vs hub-and-spoke
- Consider event-driven architecture patterns
- Assess message broker requirements
- Evaluate API gateway patterns
- Consider service mesh for microservices
- Design for loose coupling
- Document pattern selection rationale

Message Exchange Patterns
- Implement request-response patterns
- Design asynchronous messaging
- Configure publish-subscribe patterns
- Implement command query responsibility segregation (CQRS)
- Design event sourcing where appropriate
- Configure message routing and filtering
- Document message exchange flows

Data Transformation
- Design canonical data models
- Implement message transformation logic
- Configure data mapping and enrichment
- Design for schema evolution
- Implement data validation
- Configure data format conversions
- Document transformation rules

Error Handling & Resilience
- Implement retry patterns with backoff
- Configure dead letter queues
- Design circuit breaker patterns
- Implement bulkhead pattern for isolation
- Configure timeout handling
- Design compensation transactions
- Document error recovery procedures

Security Implementation
- Implement mutual TLS for system-to-system
- Configure API authentication and authorisation
- Encrypt sensitive data in transit
- Implement message signing and verification
- Configure security zones and DMZs
- Implement threat detection
- Document security architecture

Monitoring & Observability
- Implement distributed tracing
- Configure integration monitoring
- Track message flow and latency
- Monitor error rates and patterns
- Implement business process monitoring
- Configure alerting for failures
- Create integration dashboards

Performance Optimisation
- Implement message batching where appropriate
- Configure connection pooling
- Optimise message payload sizes
- Implement caching strategies
- Configure parallel processing
- Monitor and optimise throughput
- Document performance requirements

Testing Strategy
- Implement contract testing
- Configure integration testing environments
- Design for test data management
- Implement chaos engineering tests
- Configure performance testing
- Test failure scenarios
- Document testing procedures

Governance & Standards
- Define integration standards
- Implement API versioning policies
- Configure metadata management
- Document integration catalogue
- Implement change management
- Define SLAs for integrations
- Document operational procedures

Migration & Deployment
- Plan phased integration rollout
- Implement feature toggles
- Configure blue-green deployments
- Design rollback procedures
- Implement automated deployment
- Configure environment promotion
- Document deployment procedures

Deliverables:
- Integration architecture diagram
- Message flow documentation
- Data transformation specifications
- Error handling procedures
- Security implementation guide
- Monitoring and alerting configuration
- Operational runbooks', 0);

  -- 15. Test Automation Strategy
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Test Automation Strategy', 'Comprehensive test automation frameworks and strategies for quality assurance following Australian testing standards', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Test Automation Framework Design', 'Design comprehensive test automation strategy across testing pyramid.

Testing Strategy:

Test Pyramid Implementation
- Design unit test strategy (70% of tests)
- Implement integration test approach (20% of tests)
- Configure end-to-end test framework (10% of tests)
- Balance test coverage across layers
- Optimise test execution time
- Document testing philosophy
- Create testing guidelines

Unit Testing Standards
- Implement test-driven development practices
- Configure unit test framework and tools
- Design mock and stub strategies
- Implement code coverage measurement
- Set minimum coverage thresholds
- Configure automated test execution
- Document testing conventions

Integration Testing
- Design integration test scenarios
- Configure test environments
- Implement database testing strategies
- Test API integrations thoroughly
- Configure service virtualization if needed
- Implement contract testing
- Document integration test cases

End-to-End Testing
- Design user journey test scenarios
- Implement UI automation framework
- Configure cross-browser testing
- Test critical business workflows
- Implement visual regression testing
- Configure test data management
- Document E2E test scenarios

Performance Testing
- Design load testing scenarios
- Implement stress testing procedures
- Configure spike testing
- Test scalability characteristics
- Implement endurance testing
- Monitor system behaviour under load
- Document performance requirements

Security Testing
- Implement automated security scanning
- Configure penetration testing procedures
- Test authentication and authorisation
- Implement vulnerability scanning
- Test for OWASP Top 10 vulnerabilities
- Configure security regression testing
- Document security testing procedures

Test Data Management
- Design test data generation strategies
- Implement data masking for sensitive information
- Configure test data refresh procedures
- Design synthetic data generation
- Implement data cleanup procedures
- Configure database state management
- Document test data requirements

CI/CD Integration
- Integrate tests into build pipeline
- Configure automated test execution
- Implement test result reporting
- Configure test failure notifications
- Design test environment provisioning
- Implement parallel test execution
- Document CI/CD test procedures

Test Maintenance
- Implement page object pattern for UI tests
- Design for test reusability
- Configure test code reviews
- Refactor flaky tests
- Implement test reporting and analytics
- Monitor test execution trends
- Document test maintenance procedures

Quality Metrics
- Track test coverage metrics
- Monitor test execution time
- Measure defect detection rates
- Track test stability and flakiness
- Implement quality gates
- Create quality dashboards
- Document quality objectives

Deliverables:
- Test automation strategy document
- Test framework implementation
- Test case documentation
- CI/CD integration configuration
- Test data management procedures
- Quality metrics dashboards
- Testing best practices guide', 0);

END $$;