-- Packs 10-15: DevOps & CI/CD, UI/UX Design, E-commerce, Blockchain, Cybersecurity, Documentation Writing
-- Pack 10: DevOps & CI/CD (10 prompts)
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'CI/CD Pipeline Architecture', 'Design comprehensive CI/CD pipeline. Include: 1) Source control workflow strategy, 2) Build automation and artefact management, 3) Testing stages (unit, integration, E2E), 4) Security scanning integration (SAST, DAST, dependency), 5) Deployment strategies (blue-green, canary, rolling), 6) Environment management, 7) Rollback procedures, 8) Pipeline monitoring and notifications. Provide pipeline configuration for GitHub Actions, GitLab CI, or Jenkins using Australian spelling.', 1
FROM prompt_packs WHERE name = 'DevOps & CI/CD'
UNION ALL
SELECT id, 'Infrastructure as Code with Terraform', 'Implement infrastructure as code with Terraform. Include: 1) Module organisation and structure, 2) State management and remote backends, 3) Variable and secret handling, 4) Multi-environment configuration, 5) Resource dependencies and lifecycle, 6) Terraform workspace strategy, 7) Testing infrastructure code, 8) CI/CD integration for IaC. Provide Terraform modules for common cloud resources using Australian spelling.', 2
FROM prompt_packs WHERE name = 'DevOps & CI/CD'
UNION ALL
SELECT id, 'Container Orchestration with Kubernetes', 'Design Kubernetes deployment strategy. Include: 1) Deployment, StatefulSet, DaemonSet usage, 2) Service types and ingress configuration, 3) ConfigMap and Secret management, 4) Resource requests and limits optimisation, 5) Horizontal and vertical autoscaling, 6) Network policies and security contexts, 7) Persistent volume strategies, 8) Helm chart creation. Provide complete Kubernetes manifests using Australian spelling.', 3
FROM prompt_packs WHERE name = 'DevOps & CI/CD'
UNION ALL
SELECT id, 'Monitoring & Alerting Infrastructure', 'Design observability infrastructure. Include: 1) Metrics collection with Prometheus, 2) Log aggregation with ELK or Loki, 3) Distributed tracing with Jaeger, 4) Dashboard design in Grafana, 5) Alerting rules and escalation, 6) SLI/SLO/SLA definition, 7) On-call rotation setup, 8) Incident management workflow. Provide monitoring configuration and alert rules using Australian spelling.', 4
FROM prompt_packs WHERE name = 'DevOps & CI/CD'
UNION ALL
SELECT id, 'GitOps Workflow Implementation', 'Implement GitOps workflow. Include: 1) Git repository structure for environments, 2) ArgoCD or Flux CD setup, 3) Application deployment manifests, 4) Environment promotion workflow, 5) Secret management with sealed secrets, 6) Rollback procedures, 7) Progressive delivery patterns, 8) Multi-cluster management. Provide GitOps repository structure and configurations using Australian spelling.', 5
FROM prompt_packs WHERE name = 'DevOps & CI/CD'
UNION ALL
SELECT id, 'Cloud Cost Optimisation', 'Design cost optimisation strategy. Include: 1) Resource right-sizing recommendations, 2) Reserved instances and savings plans, 3) Spot instance integration, 4) Auto-scaling cost efficiency, 5) Storage tiering and lifecycle, 6) Unused resource identification, 7) Cost allocation and chargeback, 8) Budget alerts and governance. Provide cost analysis scripts and policies using Australian spelling.', 6
FROM prompt_packs WHERE name = 'DevOps & CI/CD'
UNION ALL
SELECT id, 'Disaster Recovery & Backup Strategy', 'Design disaster recovery plan. Include: 1) RTO and RPO definition, 2) Backup strategy across layers, 3) Multi-region failover procedures, 4) Database backup and restore testing, 5) DR drill procedures, 6) Incident response playbooks, 7) Communication plans, 8) Post-mortem process. Provide DR documentation and automation scripts using Australian spelling.', 7
FROM prompt_packs WHERE name = 'DevOps & CI/CD'
UNION ALL
SELECT id, 'Security Scanning & Compliance', 'Implement security scanning in CI/CD. Include: 1) SAST tools integration (SonarQube, Snyk), 2) DAST for runtime testing, 3) Dependency vulnerability scanning, 4) Container image scanning, 5) Secrets detection, 6) Compliance checking (CIS benchmarks), 7) Security gates and policies, 8) Vulnerability management workflow. Provide security pipeline configuration using Australian spelling.', 8
FROM prompt_packs WHERE name = 'DevOps & CI/CD'
UNION ALL
SELECT id, 'Configuration Management', 'Design configuration management strategy. Include: 1) Ansible playbook organisation, 2) Chef or Puppet implementation, 3) Idempotent configuration scripts, 4) Secrets management integration, 5) Configuration drift detection, 6) Inventory management, 7) Testing configuration changes, 8) Documentation standards. Provide Ansible playbooks or similar using Australian spelling.', 9
FROM prompt_packs WHERE name = 'DevOps & CI/CD'
UNION ALL
SELECT id, 'Service Mesh Implementation', 'Design service mesh architecture. Include: 1) Istio or Linkerd setup, 2) Traffic management rules, 3) Security policies (mTLS), 4) Observability integration, 5) Circuit breaker configuration, 6) Retry and timeout policies, 7) Fault injection for testing, 8) Multi-cluster mesh. Provide service mesh configurations using Australian spelling.', 10
FROM prompt_packs WHERE name = 'DevOps & CI/CD';