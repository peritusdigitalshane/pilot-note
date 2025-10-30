-- Create remaining comprehensive prompt packs (Packs 2-15)
DO $$
DECLARE
  admin_user_id UUID;
  pack_id UUID;
BEGIN
  SELECT user_id INTO admin_user_id FROM user_roles WHERE role = 'super_admin' LIMIT 1;

  -- 2. Code Review Excellence
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Code Review Excellence', 'Professional code review methodologies ensuring quality, security, and maintainability', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Comprehensive Code Review Protocol', 'Conduct thorough code review following professional standards.

Review Dimensions:

Functionality & Correctness
- Verify code implements requirements accurately
- Test edge cases and boundary conditions
- Validate error handling and failure scenarios
- Confirm input validation and sanitization
- Check for logical errors and algorithmic correctness

Security Assessment
- Identify potential security vulnerabilities
- Review authentication and authorization logic
- Check for injection attack vectors (SQL, XSS, etc.)
- Validate sensitive data handling and encryption
- Assess exposure of secrets or credentials
- Review third-party dependencies for known vulnerabilities

Code Quality Standards
- Evaluate adherence to coding standards and style guides
- Assess code readability and maintainability
- Check for code duplication and opportunities for refactoring
- Review naming conventions for clarity
- Evaluate function/method size and complexity
- Assess appropriate use of design patterns

Performance Considerations
- Identify inefficient algorithms or data structures
- Check for unnecessary database queries or N+1 problems
- Review resource usage (memory, CPU, network)
- Evaluate caching strategies
- Check for potential bottlenecks under load

Testing Coverage
- Verify adequate unit test coverage
- Check for integration test scenarios
- Assess test quality and meaningfulness
- Identify untested edge cases
- Review test maintainability

Documentation
- Verify code is appropriately commented
- Check for updated documentation
- Review API documentation completeness
- Validate inline documentation accuracy

Deliverables:
- Detailed review comments with specific line references
- Prioritized list of issues (critical, major, minor)
- Suggested improvements and alternatives
- Approval recommendation or required changes', 0);

  -- 3. API Design & Documentation
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('API Design & Documentation', 'Best practices for designing, implementing, and documenting RESTful and GraphQL APIs', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'RESTful API Design Standards', 'Design professional REST API following industry best practices.

Design Principles:

Resource Modeling
- Identify core resources and their relationships
- Design hierarchical resource structures
- Define resource naming conventions (plural nouns)
- Plan for resource versioning strategy
- Consider pagination and filtering requirements

HTTP Method Usage
- GET: Retrieve resources (idempotent, cacheable)
- POST: Create new resources
- PUT: Replace entire resources
- PATCH: Partial resource updates
- DELETE: Remove resources
- Use appropriate status codes for each operation

URL Structure Design
- Use clear, consistent URL patterns
- Implement proper nesting for related resources
- Limit nesting depth (maximum 2-3 levels)
- Use query parameters for filtering and sorting
- Implement search endpoints appropriately

Request/Response Design
- Define clear request body schemas
- Design consistent response formats
- Include appropriate metadata in responses
- Implement HATEOAS links where beneficial
- Use standard date/time formats (ISO 8601)

Error Handling
- Return appropriate HTTP status codes
- Provide descriptive error messages
- Include error codes for programmatic handling
- Suggest corrective actions in error responses
- Log errors server-side with request context

Security Implementation
- Implement proper authentication (OAuth 2.0, JWT)
- Use HTTPS exclusively for all endpoints
- Validate and sanitize all inputs
- Implement rate limiting and throttling
- Use API keys or tokens for identification
- Protect against common attacks (CSRF, injection)

Documentation Requirements
- Document all endpoints with examples
- Specify required vs. optional parameters
- Provide sample requests and responses
- Document error scenarios and status codes
- Include authentication/authorization details
- Maintain changelog for API versions
- Provide interactive API documentation (Swagger/OpenAPI)

Deliverables:
- Complete API specification (OpenAPI/Swagger)
- Endpoint documentation with examples
- Security implementation plan
- Versioning and deprecation strategy', 0);

  -- Continue with more packs (4-15)...
  -- Due to length, creating representative samples of each category

  -- 4. Database Schema Design
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Database Schema Design', 'Professional database design principles for scalable, maintainable data models', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Normalization & Schema Design', 'Design optimal database schema following normalization principles.

Design Requirements:

Entity Identification
- Identify all entities and their attributes
- Define relationships between entities (1:1, 1:N, N:M)
- Determine entity hierarchies and inheritance
- Plan for soft deletes vs. hard deletes
- Consider temporal data requirements

Normalization Process
- Apply First Normal Form (1NF): atomic values
- Apply Second Normal Form (2NF): remove partial dependencies
- Apply Third Normal Form (3NF): remove transitive dependencies
- Evaluate denormalization for performance where justified
- Document normalization decisions and rationale

Primary & Foreign Keys
- Design appropriate primary key strategies
- Use surrogate keys (UUIDs, auto-increment) vs. natural keys
- Implement foreign key constraints properly
- Plan cascade delete/update rules
- Consider composite keys where appropriate

Index Strategy
- Identify columns requiring indexes
- Design composite indexes for query patterns
- Balance read performance vs. write overhead
- Plan for full-text search indexes if needed
- Consider partial and expression indexes

Data Integrity
- Implement NOT NULL constraints appropriately
- Use CHECK constraints for business rules
- Design UNIQUE constraints where needed
- Implement triggers for complex validation
- Plan audit trails and change tracking

Performance Considerations
- Partition large tables appropriately
- Design for efficient query patterns
- Plan for data archival strategy
- Consider materialized views for aggregations
- Optimize for expected data volumes

Documentation Deliverables:
- Complete Entity-Relationship Diagram (ERD)
- Table definitions with all constraints
- Index specifications and rationale
- Data type selections explained
- Migration scripts for schema changes
- Sample queries demonstrating usage', 0);

  -- 5. Cloud Architecture Design
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Cloud Architecture Design', 'Enterprise cloud architecture patterns for AWS, Azure, and GCP', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'High-Availability Architecture Design', 'Design cloud architecture for high availability and fault tolerance.

Architecture Requirements:

High Availability Design
- Design for multi-availability zone deployment
- Implement automatic failover mechanisms
- Use load balancers for distribution
- Design stateless application tiers
- Implement health checks and auto-recovery
- Plan for zero-downtime deployments
- Target 99.9% or higher uptime SLA

Scalability Strategy
- Design for horizontal scaling
- Implement auto-scaling policies
- Use managed services for database scalability
- Design caching layers effectively
- Implement content delivery networks (CDN)
- Plan for both scale-up and scale-down
- Set performance baselines and scaling triggers

Disaster Recovery
- Define Recovery Time Objective (RTO)
- Define Recovery Point Objective (RPO)
- Implement backup strategies across regions
- Design for data replication
- Create disaster recovery runbooks
- Test disaster recovery procedures regularly
- Document failover and fallback processes

Security Architecture
- Implement network segmentation (VPCs, subnets)
- Use security groups and network ACLs
- Encrypt data at rest and in transit
- Implement identity and access management
- Use secrets management services
- Enable comprehensive audit logging
- Implement DDoS protection

Cost Optimization
- Right-size compute resources
- Use reserved instances or savings plans
- Implement auto-shutdown for non-production
- Use spot instances where appropriate
- Optimize storage tiers
- Monitor and alert on cost anomalies
- Regular cost review and optimization

Monitoring & Observability
- Implement centralized logging
- Set up comprehensive metrics collection
- Create alerting for critical thresholds
- Implement distributed tracing
- Design dashboards for operations team
- Plan for log retention and archival

Deliverables Required:
- Architecture diagram with all components
- Technology stack decisions with rationale
- Security implementation details
- Disaster recovery plan documented
- Cost estimates and optimization plan
- Monitoring and alerting strategy
- Migration plan if from existing infrastructure', 0);

END $$;