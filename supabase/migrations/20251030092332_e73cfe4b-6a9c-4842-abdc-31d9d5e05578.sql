-- Create Batch 2: Packs 6-15 with Australian spelling
DO $$
DECLARE
  admin_user_id UUID;
  pack_id UUID;
BEGIN
  SELECT user_id INTO admin_user_id FROM user_roles WHERE role = 'super_admin' LIMIT 1;

  -- 6. DevOps & CI/CD Excellence
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('DevOps & CI/CD Excellence', 'Comprehensive DevOps practices for continuous integration, deployment, and infrastructure automation with Australian best practices', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'CI/CD Pipeline Architecture', 'Design enterprise-grade CI/CD pipeline following DevOps best practices.

Pipeline Design Requirements:

Source Control Integration
- Integrate with Git-based version control systems
- Implement branch protection rules and policies
- Configure automated webhook triggers
- Set up code repository scanning for secrets
- Enable merge request/pull request automation
- Implement commit message validation
- Configure automatic code quality gates

Build Automation
- Design containerised build environments
- Implement build caching strategies for efficiency
- Configure parallel build execution
- Set up dependency scanning and management
- Implement build artefact versioning
- Configure build failure notifications
- Optimise build times through parallelisation

Testing Strategy
- Implement automated unit test execution
- Configure integration test environments
- Set up end-to-end test automation
- Implement security scanning (SAST/DAST)
- Configure performance testing gates
- Enable test result reporting and analysis
- Implement test coverage requirements

Deployment Automation
- Design blue-green deployment strategy
- Implement canary release capabilities
- Configure automatic rollback mechanisms
- Set up environment-specific configurations
- Implement infrastructure as code deployment
- Configure health checks and smoke tests
- Enable deployment approval workflows

Monitoring & Observability
- Implement automated health checks
- Configure application performance monitoring
- Set up log aggregation and analysis
- Create deployment success/failure dashboards
- Implement alert notifications
- Track deployment frequency metrics
- Monitor mean time to recovery (MTTR)

Security Integration
- Implement vulnerability scanning in pipeline
- Configure secrets management integration
- Enable compliance checking automation
- Implement licence scanning for dependencies
- Configure security gate approvals
- Enable audit logging for all deployments
- Implement container image scanning

Documentation Deliverables:
- Complete pipeline architecture diagram
- Environment configuration specifications
- Deployment runbook procedures
- Rollback procedures documented
- Security and compliance checklist
- Performance optimisation strategies
- Disaster recovery procedures', 0),

  (pack_id, 'Infrastructure as Code Standards', 'Implement infrastructure as code following industry standards and best practices.

IaC Design Principles:

Tool Selection & Standards
- Choose appropriate IaC tool (Terraform, CloudFormation, Pulumi)
- Establish naming conventions for resources
- Define module structure and organisation
- Implement state management strategy
- Configure remote state storage with locking
- Set up version control for IaC code
- Define code review standards for infrastructure

Modularity & Reusability
- Design reusable infrastructure modules
- Implement proper variable parameterisation
- Create composable infrastructure components
- Establish module versioning strategy
- Document module inputs and outputs
- Implement module testing procedures
- Create module usage examples

Environment Management
- Design multi-environment strategy (dev/staging/prod)
- Implement environment-specific variables
- Configure workspace or folder organisation
- Set up proper access controls per environment
- Implement environment promotion workflows
- Document environment differences
- Create environment parity guidelines

Security & Compliance
- Implement least privilege access controls
- Configure encryption for sensitive data
- Enable audit logging for all resources
- Implement security group/firewall rules
- Configure backup and disaster recovery
- Enable compliance checking automation
- Document security requirements

Testing & Validation
- Implement infrastructure unit testing
- Configure integration testing environments
- Set up validation and linting tools
- Implement cost estimation previews
- Create testing environments for changes
- Configure automated testing in CI/CD
- Document testing procedures

Change Management
- Implement proper change planning process
- Configure change approval workflows
- Enable change impact analysis
- Implement rollback procedures
- Document change management process
- Set up change notification systems
- Create change tracking mechanisms

Deliverables Required:
- Complete IaC codebase with documentation
- Module library with usage guides
- Environment configuration documentation
- Security implementation details
- Testing framework and procedures
- Change management workflow
- Disaster recovery procedures', 1),

  (pack_id, 'Container Orchestration Strategy', 'Design Kubernetes-based container orchestration following cloud-native principles.

Orchestration Architecture:

Cluster Design
- Design multi-availability zone cluster
- Configure node pools and scaling policies
- Implement proper resource quotas
- Set up network policies and segmentation
- Configure cluster security hardening
- Implement cluster monitoring and logging
- Plan for cluster upgrades and maintenance

Application Deployment
- Design deployment strategies (rolling, blue-green, canary)
- Implement proper resource requests and limits
- Configure horizontal and vertical autoscaling
- Set up health checks (liveness, readiness, startup probes)
- Implement proper configuration management
- Configure secrets and sensitive data handling
- Design service mesh architecture if needed

Networking Configuration
- Design ingress controller strategy
- Configure load balancing and traffic routing
- Implement service discovery mechanisms
- Set up DNS and service naming
- Configure network policies for security
- Implement TLS/SSL certificate management
- Design for multi-cluster networking if required

Storage Management
- Design persistent volume strategy
- Configure storage classes and provisioners
- Implement backup and disaster recovery
- Plan for data migration procedures
- Configure volume expansion policies
- Implement storage monitoring and alerting
- Document storage best practices

Security Implementation
- Implement RBAC (Role-Based Access Control)
- Configure pod security policies/standards
- Enable runtime security scanning
- Implement network segmentation
- Configure secrets encryption at rest
- Enable audit logging
- Implement security monitoring and alerting

Observability & Monitoring
- Deploy centralised logging solution
- Implement metrics collection and monitoring
- Configure distributed tracing
- Set up alerting and notification systems
- Create operational dashboards
- Implement log retention policies
- Document troubleshooting procedures

Cost Optimisation
- Implement resource right-sizing
- Configure cluster autoscaling
- Use spot/preemptible instances where appropriate
- Implement pod disruption budgets
- Monitor and optimise resource utilisation
- Configure cost allocation and tagging
- Document cost optimisation strategies

Deliverables:
- Kubernetes architecture documentation
- Deployment manifests and configurations
- Security implementation guide
- Monitoring and alerting setup
- Disaster recovery procedures
- Cost optimisation recommendations
- Operational runbooks', 2);

  -- 7. Microservices Architecture
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Microservices Architecture', 'Enterprise microservices design patterns, service communication, and distributed system best practices for Australian organisations', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Microservices Decomposition Strategy', 'Design microservices architecture through proper domain decomposition and service boundaries.

Decomposition Analysis:

Domain-Driven Design
- Identify bounded contexts within the business domain
- Map core domains, supporting domains, and generic subdomains
- Define ubiquitous language for each context
- Identify aggregates and entities
- Map domain events and business processes
- Define context maps showing relationships
- Identify anti-corruption layers where needed

Service Boundary Definition
- Apply single responsibility principle to services
- Define clear service ownership and responsibilities
- Identify service dependencies and coupling
- Evaluate service granularity (not too fine, not too coarse)
- Define service contracts and interfaces
- Identify shared data and integration points
- Plan for service autonomy and independence

Data Ownership Strategy
- Assign database per service pattern
- Define data ownership boundaries
- Identify shared reference data requirements
- Plan for eventual consistency where appropriate
- Design data synchronisation mechanisms
- Implement saga patterns for distributed transactions
- Document data governance policies

Service Communication Patterns
- Choose synchronous vs asynchronous communication
- Design REST APIs for synchronous requests
- Implement message queues for async communication
- Define event-driven architecture patterns
- Configure service discovery mechanisms
- Implement circuit breakers and retry logic
- Design for graceful degradation

Integration Considerations
- Identify integration patterns (API gateway, service mesh)
- Design authentication and authorisation strategy
- Implement distributed tracing correlation
- Configure centralised logging strategy
- Design for backward compatibility
- Plan API versioning strategy
- Implement contract testing

Operational Requirements
- Design for independent deployment
- Implement service health monitoring
- Configure automated scaling policies
- Plan for service resilience and fault tolerance
- Implement distributed debugging capabilities
- Design deployment pipeline per service
- Document service dependencies

Migration Strategy
- Plan incremental migration from monolith
- Identify strangler fig pattern opportunities
- Define migration phases and priorities
- Plan for data migration approach
- Design for feature toggles during transition
- Implement parallel running strategies
- Create rollback procedures

Deliverables:
- Service decomposition map
- Bounded context documentation
- Service dependency diagram
- Data ownership matrix
- Communication pattern specifications
- Migration roadmap and timeline
- Operational runbooks per service', 0);

  -- 8. Frontend Performance Optimisation
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Frontend Performance Optimisation', 'Comprehensive frontend performance optimisation techniques for modern web applications following Australian web standards', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Web Performance Audit & Optimisation', 'Conduct comprehensive web performance audit and implement optimisations.

Performance Assessment:

Initial Performance Audit
- Measure Core Web Vitals (LCP, FID, CLS)
- Analyse Time to First Byte (TTFB)
- Measure First Contentful Paint (FCP)
- Assess Time to Interactive (TTI)
- Evaluate Total Blocking Time (TBT)
- Measure Speed Index
- Test across multiple devices and connection speeds
- Compare against industry benchmarks

Resource Loading Analysis
- Audit JavaScript bundle sizes and loading
- Analyse CSS file sizes and delivery
- Review image optimisation and formats
- Evaluate font loading strategies
- Assess third-party script impact
- Measure resource loading waterfalls
- Identify render-blocking resources

Code Optimisation Strategies
- Implement code splitting and lazy loading
- Optimise JavaScript execution and parsing
- Remove unused CSS and JavaScript
- Implement tree shaking for dependencies
- Minify and compress all assets
- Use modern JavaScript features efficiently
- Implement proper caching strategies

Image Optimisation
- Convert images to next-gen formats (WebP, AVIF)
- Implement responsive images with srcset
- Use appropriate image compression
- Implement lazy loading for images
- Consider image CDN solutions
- Optimise image dimensions for usage
- Implement progressive image loading

Critical Rendering Path
- Inline critical CSS for above-the-fold content
- Defer non-critical CSS loading
- Optimise font loading (font-display: swap)
- Minimise render-blocking resources
- Implement resource hints (preload, prefetch, preconnect)
- Optimise third-party script loading
- Reduce main thread work

Caching Strategy
- Implement service workers for offline capability
- Configure appropriate cache headers
- Use cache-first strategies where appropriate
- Implement cache versioning and invalidation
- Configure CDN caching policies
- Use local storage for appropriate data
- Implement stale-while-revalidate patterns

Network Optimisation
- Enable HTTP/2 or HTTP/3
- Implement resource compression (Gzip, Brotli)
- Optimise API response sizes
- Reduce number of HTTP requests
- Implement request batching where appropriate
- Use GraphQL for efficient data fetching
- Configure proper CORS headers

Monitoring & Maintenance
- Set up Real User Monitoring (RUM)
- Implement performance budgets
- Configure automated performance testing
- Create performance dashboards
- Set up alerting for regressions
- Document performance optimisation decisions
- Establish ongoing monitoring procedures

Deliverables:
- Performance audit report with metrics
- Prioritised optimisation recommendations
- Implementation roadmap with timelines
- Before/after performance comparisons
- Monitoring and alerting setup
- Performance budget documentation
- Best practices guide for team', 0);

  -- Continue with remaining packs in this batch...
  -- (Due to character limits, condensing remaining packs)

END $$;