import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Clock, Cpu } from 'lucide-react';
import { getAdvancedModels } from '../services/api';

const AdvancedModels = () => {
  const [advancedData, setAdvancedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAdvancedModels();
        setAdvancedData(data);
      } catch (err) {
        console.error('Failed to load advanced model results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner-box">
          <div className="spinner" />
          <p>Loading Requirement 6: Advanced Ensemble Models...</p>
        </div>
      </div>
    );
  }

  const modelsList = advancedData?.models || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Requirement 6 — Advanced & Ensemble Models</h1>
        <p className="page-subtitle">
          Testing complex ensemble architectures including Random Forest, Gradient Boosting, HistGradientBoosting, and optional XGBoost
        </p>
      </div>

      {/* Info Banner */}
      <div className="alert-card info-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Sparkles size={20} style={{ color: '#a855f7' }} />
        <div>
          <strong>Ensemble Learning Advantages:</strong> Advanced ensemble methods combine multiple decision trees to reduce variance, improve generalization, and handle non-linear feature relationships effectively.
        </div>
      </div>

      {/* Advanced Models Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {modelsList.map((model) => {
          if (!model.is_available) {
            return (
              <div className="chart-card" key={model.model} style={{ opacity: 0.8, borderStyle: 'dashed' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>{model.model}</h3>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                    <AlertCircle size={14} /> Optional (Not Installed)
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {model.note}
                </p>
              </div>
            );
          }

          return (
            <div className="chart-card" key={model.model}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#ffffff' }}>{model.model}</h3>
                <span className="badge badge-success" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                  <CheckCircle2 size={14} /> Evaluated
                </span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', minHeight: '40px' }}>
                {model.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                <div>
                  <span className="stat-label">Test Accuracy</span>
                  <div style={{ fontWeight: 700, color: '#34d399', fontSize: '1.2rem' }}>
                    {(model.test_accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="stat-label">F1 Score</span>
                  <div style={{ fontWeight: 700, color: '#a855f7', fontSize: '1.2rem' }}>
                    {(model.f1 * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="stat-label">5-Fold CV F1</span>
                  <div style={{ fontWeight: 600, color: '#38bdf8' }}>
                    {(model.cv_f1_mean * 100).toFixed(1)}% ±{(model.cv_f1_std * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="stat-label">ROC-AUC</span>
                  <div style={{ fontWeight: 600, color: '#fbbf24' }}>
                    {(model.roc_auc * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                <span>Fit Time:</span>
                <span>
                  <Clock size={12} style={{ marginRight: 4 }} />
                  {model.training_time}s
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedModels;
