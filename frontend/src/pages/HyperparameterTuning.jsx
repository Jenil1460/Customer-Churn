import React, { useEffect, useState } from 'react';
import { Sliders, Award, Clock, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { getHyperparameterTuning } from '../services/api';

const HyperparameterTuning = () => {
  const [tuningSummary, setTuningSummary] = useState([]);
  const [expandedModel, setExpandedModel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getHyperparameterTuning();
        setTuningSummary(data || []);
      } catch (err) {
        console.error('Failed to load hyperparameter tuning results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (modelName) => {
    setExpandedModel(expandedModel === modelName ? null : modelName);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner-box">
          <div className="spinner" />
          <p>Loading Requirement 5: Hyperparameter Tuning Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Requirement 5 — Hyperparameter Tuning Lab</h1>
        <p className="page-subtitle">
          Real <code>GridSearchCV</code> hyperparameter search using 5-Fold Stratified Cross-Validation optimizing F1 Score on Churn class
        </p>
      </div>

      {/* Tuning Specs Banner */}
      <div className="alert-card info-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Sliders size={20} style={{ color: '#38bdf8' }} />
        <div>
          <strong>Tuning Strategy:</strong> All hyperparameter combinations were cross-validated on training data only (<code>X_train</code>). Primary tuning score: <strong>F1 Score for Churn (1)</strong> due to class imbalance.
        </div>
      </div>

      {/* Tuned Models Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {tuningSummary.map((item) => {
          const isExpanded = expandedModel === item.model;
          return (
            <div className="chart-card" key={item.model} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(item.model)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.6rem', borderRadius: '8px', color: '#6366f1' }}>
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{item.model}</h3>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      Best CV F1: <strong style={{ color: '#a855f7' }}>{(item.best_cv_f1 * 100).toFixed(1)}%</strong> | Test F1: <strong style={{ color: '#34d399' }}>{(item.test_f1 * 100).toFixed(1)}%</strong>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span className="stat-label">Tuning Duration</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <Clock size={14} style={{ marginRight: 4 }} />
                      {item.tuning_duration}s
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Best Parameter Badges */}
              <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {Object.entries(item.best_params || {}).map(([param, val]) => (
                  <span
                    key={param}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.825rem',
                      color: '#e2e8f0',
                    }}
                  >
                    <code style={{ color: '#38bdf8' }}>{param}</code>: <strong>{String(val)}</strong>
                  </span>
                ))}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-color)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#ffffff' }}>Untouched Test Set Evaluation Post-Tuning:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px' }}>
                      <span className="stat-label">Test Accuracy</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>
                        {(item.test_accuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px' }}>
                      <span className="stat-label">Test F1 Score</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a855f7' }}>
                        {(item.test_f1 * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px' }}>
                      <span className="stat-label">Test ROC-AUC</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                        {(item.test_roc_auc * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HyperparameterTuning;
