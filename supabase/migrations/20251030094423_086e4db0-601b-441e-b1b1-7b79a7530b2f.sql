-- Pack 8: Machine Learning Integration
INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index)
SELECT id, 'ML Model Training Pipeline', 'Design a complete machine learning training pipeline. Include: 1) Data preprocessing and feature engineering, 2) Train/validation/test split strategy, 3) Model selection and hyperparameter tuning, 4) Cross-validation approach, 5) Training monitoring and visualisation, 6) Overfitting prevention techniques, 7) Model versioning with MLflow or similar, 8) Experiment tracking and comparison. Provide Python code with scikit-learn/TensorFlow/PyTorch examples using Australian spelling.', 1
FROM prompt_packs WHERE name = 'Machine Learning Integration'
UNION ALL
SELECT id, 'ML Model Deployment & Serving', 'Design ML model deployment architecture. Include: 1) Model serialisation and packaging, 2) REST API for model serving (Flask, FastAPI), 3) Batch prediction pipelines, 4) Real-time inference optimisation, 5) Model versioning and A/B testing, 6) Containerisation with Docker, 7) Scaling strategies (horizontal, GPU), 8) Monitoring and logging. Provide deployment code and Kubernetes/serverless configurations using Australian spelling.', 2
FROM prompt_packs WHERE name = 'Machine Learning Integration'
UNION ALL
SELECT id, 'Feature Store & Data Pipeline', 'Design feature store and data pipeline for ML. Include: 1) Feature engineering automation, 2) Feature versioning and lineage, 3) Online and offline feature serving, 4) Data quality monitoring, 5) Feature computation optimization, 6) Data lake/warehouse integration, 7) Feature discovery and documentation, 8) Real-time vs batch feature computation. Provide architecture using Feast, Tecton, or custom solution with Australian spelling.', 3
FROM prompt_packs WHERE name = 'Machine Learning Integration'
UNION ALL
SELECT id, 'Computer Vision Implementation', 'Implement computer vision solution. Include: 1) Image preprocessing and augmentation, 2) Pre-trained model selection (ResNet, EfficientNet, YOLO), 3) Transfer learning implementation, 4) Object detection and segmentation, 5) Model optimisation for edge devices, 6) Real-time video processing, 7) Evaluation metrics (mAP, IoU), 8) Model explainability with Grad-CAM. Provide implementation with PyTorch or TensorFlow using Australian spelling.', 4
FROM prompt_packs WHERE name = 'Machine Learning Integration'
UNION ALL
SELECT id, 'Natural Language Processing Pipeline', 'Design NLP processing pipeline. Include: 1) Text preprocessing and tokenisation, 2) Embedding strategies (Word2Vec, BERT, GPT), 3) Sentiment analysis implementation, 4) Named entity recognition, 5) Text classification or generation, 6) Fine-tuning transformer models, 7) Handling multilingual data, 8) Evaluation metrics (F1, BLEU, ROUGE). Provide implementation with Hugging Face Transformers using Australian spelling.', 5
FROM prompt_packs WHERE name = 'Machine Learning Integration'
UNION ALL
SELECT id, 'ML Model Monitoring & Drift Detection', 'Implement ML model monitoring in production. Include: 1) Prediction accuracy tracking, 2) Data drift detection, 3) Concept drift monitoring, 4) Feature distribution monitoring, 5) Model performance degradation alerts, 6) Automated retraining triggers, 7) Shadow deployment for testing, 8) Explainability monitoring. Provide monitoring setup with Evidently AI or custom solutions using Australian spelling.', 6
FROM prompt_packs WHERE name = 'Machine Learning Integration'
UNION ALL
SELECT id, 'AutoML & Hyperparameter Tuning', 'Implement automated machine learning and tuning. Include: 1) AutoML framework selection (Auto-sklearn, AutoKeras), 2) Hyperparameter search strategies (grid, random, Bayesian), 3) Neural architecture search, 4) Feature selection automation, 5) Ensemble model creation, 6) Computational budget management, 7) Multi-objective optimisation, 8) Results interpretation and model selection. Provide implementation examples with Optuna or Ray Tune using Australian spelling.', 7
FROM prompt_packs WHERE name = 'Machine Learning Integration'
UNION ALL
SELECT id, 'ML Model Explainability & Interpretability', 'Implement model explainability techniques. Include: 1) SHAP values for feature importance, 2) LIME for local interpretability, 3) Feature importance visualisation, 4) Partial dependence plots, 5) Attention mechanism visualisation, 6) Model-agnostic methods, 7) Counterfactual explanations, 8) Explanation serving in production. Provide implementation with SHAP, LIME, and custom visualisations using Australian spelling.', 8
FROM prompt_packs WHERE name = 'Machine Learning Integration'
UNION ALL
SELECT id, 'Recommendation System Design', 'Design a recommendation system. Include: 1) Collaborative filtering implementation, 2) Content-based filtering approach, 3) Hybrid recommendation strategies, 4) Matrix factorisation techniques, 5) Deep learning for recommendations, 6) Cold start problem handling, 7) Real-time recommendation serving, 8) Evaluation metrics (precision@k, NDCG, diversity). Provide implementation with examples using Australian spelling.', 9
FROM prompt_packs WHERE name = 'Machine Learning Integration'
UNION ALL
SELECT id, 'ML Pipeline Orchestration', 'Design end-to-end ML pipeline orchestration. Include: 1) Workflow orchestration (Airflow, Kubeflow, Prefect), 2) Data ingestion and validation, 3) Feature engineering automation, 4) Model training and evaluation, 5) Model deployment pipeline, 6) Monitoring and alerting integration, 7) Rollback and versioning, 8) CI/CD for ML (MLOps). Provide complete pipeline configuration using Australian spelling.', 10
FROM prompt_packs WHERE name = 'Machine Learning Integration';