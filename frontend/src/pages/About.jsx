import React, { useState } from 'react';
import {
  GraduationCap,
  Layers,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
} from 'lucide-react';

const vivaQuestions = [
  {
    q: 'What is Logistic Regression?',
    a: 'Logistic Regression is a supervised classification algorithm that models the probability of a binary outcome (e.g. Churn = Yes or No) using the logistic sigmoid function to map linear combinations of features to a value between 0 and 1.',
  },
  {
    q: 'What is Cross-Validation and why use 5 folds?',
    a: 'Cross-Validation partitions training data into 5 equal folds. The model is iteratively trained on 4 folds and validated on the 5th fold. This provides a robust, low-variance estimate of model generalization without leaking test data.',
  },
  {
    q: 'What is Overfitting vs Underfitting?',
    a: 'Overfitting occurs when a model learns training noise and performs poorly on unseen data (high training accuracy, low test/CV accuracy). Underfitting occurs when a model is too simple to capture underlying relationships (low training and test accuracy).',
  },
  {
    q: 'Why compare multiple baseline models?',
    a: 'Comparing diverse algorithmic families (linear, tree-based, distance-based, distance margin) allows data scientists to evaluate variance, bias, and performance tradeoffs under equivalent preprocessing conditions.',
  },
  {
    q: 'What is Hyperparameter Tuning?',
    a: 'Hyperparameter tuning uses search strategies (e.g. GridSearchCV) with cross-validation to discover optimal model settings (e.g. regularization C, tree depth) that maximize evaluation metrics such as F1 score.',
  },
  {
    q: 'Why use Random Forest & Gradient Boosting?',
    a: 'Random Forest builds independent trees with bagging to reduce variance. Gradient Boosting builds sequential trees to minimize residual errors. Both excel at capturing complex non-linear feature interactions in tabular data.',
  },
  {
    q: 'What is ROC-AUC?',
    a: 'ROC-AUC (Receiver Operating Characteristic - Area Under Curve) measures a binary classifier discriminative ability across all threshold cutoffs, independently of class imbalance.',
  },
  {
    q: 'What is Precision, Recall, and F1 Score?',
    a: 'Precision = TP / (TP + FP) (ratio of true churns among predicted churns). Recall = TP / (TP + FN) (ratio of actual churns captured). F1 Score is the harmonic mean of Precision and Recall.',
  },
  {
    q: 'What is a Confusion Matrix?',
    a: 'A confusion matrix breaks down predictions into True Negatives (TN), False Positives (FP), False Negatives (FN), and True Positives (TP) to evaluate diagnostic errors.',
  },
];

const About = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleQuestion = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const workflowSteps = [
    'Excel Dataset Load',
    'Data Cleaning & Prep',
    'Stratified Train/Test Split',
    'ColumnTransformer Preprocessing',
    'Baseline Model Fitting',
    '5-Fold Cross Validation',
    'Overfitting Analysis',
    'Model Comparison Table',
    'GridSearchCV Tuning',
    'Advanced Ensemble Models',
    'CV F1 Model Selection',
    'Untouched Test Set Evaluation',
    'Model & Artifact Persistence',
    'REST API Predictions',
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">ML Workflow Architecture & Viva Preparation</h1>
        <p className="page-subtitle">
          Complete academic demonstration of the 6 Machine Learning requirements for college viva defense
        </p>
      </div>

      {/* ML Workflow Flowchart Card */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <h3>Step-by-Step Machine Learning Pipeline Workflow</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Real pipeline execution sequence from raw Excel dataset to FastAPI production prediction
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {workflowSteps.map((step, idx) => (
            <div
              key={step}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  color: '#ffffff',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Viva Q&A Accordion */}
      <div className="chart-card">
        <h3>Viva Defense Q&A Explanations</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Technical explanations for core machine learning concepts
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {vivaQuestions.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: isOpen ? '#38bdf8' : '#ffffff',
                  }}
                  onClick={() => toggleQuestion(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={18} style={{ color: '#6366f1' }} />
                    <span>{item.q}</span>
                  </div>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 1.25rem 1rem 1.25rem',
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: '0.75rem',
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default About;
