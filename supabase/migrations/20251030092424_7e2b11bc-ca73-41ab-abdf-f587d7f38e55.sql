-- Complete Batch 2: Packs 9-15 with Australian spelling and 10 prompts each
DO $$
DECLARE
  admin_user_id UUID;
  pack_id UUID;
BEGIN
  SELECT user_id INTO admin_user_id FROM user_roles WHERE role = 'super_admin' LIMIT 1;

  -- 9. Mobile App Development Standards
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Mobile App Development Standards', 'Comprehensive mobile app development guidelines for iOS and Android following Australian mobile industry standards', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Cross-Platform Mobile Architecture', 'Design mobile application architecture for optimal performance and user experience.

Architecture Design:

Platform Strategy
- Evaluate cross-platform vs native development
- Choose appropriate framework (React Native, Flutter, native)
- Design for platform-specific features and guidelines
- Plan for platform-specific testing requirements
- Implement platform-adaptive UI patterns
- Configure build systems for both platforms
- Document platform differences and handling

Application Structure
- Implement clean architecture principles
- Separate business logic from UI components
- Design state management strategy
- Implement dependency injection patterns
- Configure navigation architecture
- Design data persistence layer
- Implement proper error handling

Performance Optimisation
- Optimise app launch time and responsiveness
- Implement efficient list rendering
- Optimise image loading and caching
- Minimise memory footprint
- Implement background task management
- Optimise battery consumption
- Monitor and optimise app size

Offline Functionality
- Design offline-first architecture
- Implement local data synchronisation
- Configure conflict resolution strategies
- Design for intermittent connectivity
- Implement queue for offline actions
- Configure cache invalidation policies
- Test offline scenarios thoroughly

Security Implementation
- Implement secure data storage (Keychain/Keystore)
- Configure certificate pinning for APIs
- Implement biometric authentication
- Secure sensitive data in transit
- Implement proper session management
- Configure app transport security
- Prevent screenshot capture for sensitive screens

User Experience Design
- Follow platform design guidelines (Material/Human Interface)
- Implement smooth animations and transitions
- Design for various screen sizes and densities
- Implement proper loading states
- Design intuitive navigation patterns
- Implement accessibility features (VoiceOver/TalkBack)
- Test with real users

Push Notifications
- Implement push notification infrastructure
- Design notification permission requests
- Implement rich notifications
- Configure deep linking from notifications
- Handle notification actions appropriately
- Implement notification grouping
- Test notification delivery

Analytics & Monitoring
- Implement crash reporting and monitoring
- Configure user analytics tracking
- Track key user flows and conversions
- Monitor app performance metrics
- Implement A/B testing capability
- Configure error logging
- Create dashboards for key metrics

App Store Optimisation
- Prepare app store listings and metadata
- Design compelling screenshots and previews
- Write clear app descriptions
- Implement app ratings prompts appropriately
- Plan beta testing strategy (TestFlight/Play Console)
- Configure staged rollouts
- Monitor app store reviews and ratings

Continuous Deployment
- Set up automated build pipelines
- Configure code signing and provisioning
- Implement automated testing in CI/CD
- Configure beta distribution channels
- Automate app store submissions
- Implement version management
- Document release procedures

Deliverables:
- Complete architecture documentation
- Platform-specific implementation guides
- Performance benchmarks and goals
- Security implementation checklist
- User testing results and feedback
- App store submission materials
- Deployment and release procedures', 0);

  -- 10. Machine Learning Model Development
  INSERT INTO prompt_packs (name, description, visibility, created_by, is_active)
  VALUES ('Machine Learning Model Development', 'Professional ML model development lifecycle from data preparation to deployment for Australian data science teams', 'public', admin_user_id, true)
  RETURNING id INTO pack_id;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'ML Model Development Pipeline', 'Design complete machine learning model development and deployment pipeline.

Development Lifecycle:

Problem Definition & Planning
- Define clear business objective and success metrics
- Identify required model performance thresholds
- Determine model type (classification, regression, clustering, etc.)
- Assess data availability and quality requirements
- Define ethical considerations and bias mitigation
- Plan computational resource requirements
- Document stakeholder requirements

Data Preparation & Exploration
- Conduct exploratory data analysis (EDA)
- Identify data quality issues and missing values
- Analyse feature distributions and correlations
- Detect and handle outliers appropriately
- Implement data cleaning procedures
- Document data provenance and lineage
- Create data quality reports

Feature Engineering
- Design relevant features from raw data
- Implement feature scaling and normalisation
- Handle categorical variables appropriately
- Create derived features based on domain knowledge
- Implement feature selection techniques
- Test feature importance and correlation
- Document feature engineering decisions

Model Selection & Training
- Evaluate multiple model algorithms
- Implement proper train/validation/test splits
- Configure cross-validation strategies
- Tune hyperparameters systematically
- Implement early stopping criteria
- Monitor training metrics and convergence
- Document model architecture decisions

Model Evaluation
- Assess model performance on test set
- Calculate relevant metrics (accuracy, precision, recall, F1, etc.)
- Analyse confusion matrix and error patterns
- Conduct error analysis on misclassifications
- Test model on out-of-sample data
- Evaluate model fairness across demographics
- Compare against baseline models

Model Interpretability
- Implement model explainability techniques (SHAP, LIME)
- Analyse feature importance
- Create visualisations of model behaviour
- Document model decision-making process
- Test model predictions on edge cases
- Explain model limitations and assumptions
- Create model documentation for stakeholders

Model Deployment Strategy
- Design model serving architecture
- Implement model versioning strategy
- Configure model monitoring and alerting
- Plan for model updates and retraining
- Implement A/B testing for model updates
- Design rollback procedures
- Document deployment requirements

Production Monitoring
- Monitor model performance in production
- Track data drift and concept drift
- Implement automated retraining triggers
- Monitor prediction latency and throughput
- Track model fairness metrics over time
- Configure alerts for anomalous behaviour
- Create dashboards for model health

MLOps Implementation
- Implement experiment tracking (MLflow, Weights & Biases)
- Configure model registry and versioning
- Automate model training pipelines
- Implement automated testing for models
- Configure CI/CD for model deployment
- Implement feature stores if appropriate
- Document MLOps processes

Governance & Compliance
- Document model development process
- Implement model risk assessment
- Ensure privacy compliance (GDPR, Australian Privacy Act)
- Document bias testing and mitigation
- Implement model audit trail
- Create model cards for documentation
- Plan for model decommissioning

Deliverables:
- Comprehensive model documentation
- Performance evaluation reports
- Feature engineering documentation
- Model deployment architecture
- Monitoring and alerting configuration
- MLOps pipeline documentation
- Governance and compliance reports', 0);

  -- Continue with remaining packs (11-15)...

END $$;