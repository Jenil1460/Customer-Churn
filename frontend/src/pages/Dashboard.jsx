import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getFinalModel, getDatasetInfo, retrainModel } from '../services/api';

const COLORS = ['#10b981', '#ef4444'];

const Dashboard = () => {
  const [finalModel, setFinalModel] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainStep, setRetrainStep] = useState('');
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modelData, dsData] = await Promise.all([
        getFinalModel().catch(() => null),
        getDatasetInfo().catch(() => null),
      ]);
      setFinalModel(modelData);
      setDatasetInfo(dsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard metrics. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetrain = async () => {
    setShowConfirm(false);
    setRetraining(true);
    setRetrainStep('Loading dataset & running stratified split...');

    try {
      setTimeout(() => setRetrainStep('Evaluating baseline models & 5-fold cross validation...'), 1500);
      setTimeout(() => setRetrainStep('Running GridSearchCV hyperparameter tuning...'), 3500);
      setTimeout(() => setRetrainStep('Evaluating ensemble models & selecting winner...'), 5500);

      await retrainModel();
      setRetrainStep('Retraining complete! Reloading metrics...');
      await fetchData();
    } catch (err) {
      alert('Retraining failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setRetraining(false);
      setRetrainStep('');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner-box">
          <div className="spinner" />
          <p>Loading ChurnIQ Dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = finalModel?.final_test_metrics || {};
  const churnDist = datasetInfo?.churn_distribution || {};
  const pieData = [
    { name: 'No Churn', value: churnDist['No'] || churnDist[0] || 0 },
    { name: 'Churned', value: churnDist['Yes'] || churnDist[1] || 0 },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Customer Churn Executive Dashboard</h1>
          <p className="page-subtitle">
            Real-time machine learning predictions and model performance metrics derived from Telco dataset
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowConfirm(true)}
          disabled={retraining}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <RotateCcw size={16} className={retraining ? 'spin' : ''} />
          <span>{retraining ? 'Retraining Models...' : 'Retrain Models'}</span>
        </button>
      </div>

      {retraining && (
        <div className="alert-card info-card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: 20, height: 20 }} />
          <div>
            <strong>ML Workflow in Progress:</strong> {retrainStep}
          </div>
        </div>
      )}

      {error && (
        <div className="alert-card error-card" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Production Model Winner Banner */}
      {finalModel && (
        <div className="winner-banner" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              <Award size={18} /> PRODUCTION PREDICTION MODEL
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
              {finalModel.final_model_name}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Selected via 5-Fold Cross Validation F1 score on training data and evaluated once on untouched test set.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div>
              <span className="stat-label">CV F1 Mean</span>
              <div className="stat-value" style={{ color: '#38bdf8' }}>
                {(finalModel.validation_cv_metrics?.cv_f1_mean * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="stat-label">Test F1 Score</span>
              <div className="stat-value" style={{ color: '#a855f7' }}>
                {(metrics.f1_score * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="stat-label">Test Accuracy</span>
              <div className="stat-value" style={{ color: '#34d399' }}>
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Test Accuracy</span>
            <CheckCircle2 size={18} style={{ color: '#34d399' }} />
          </div>
          <div className="metric-value">{(metrics.accuracy * 100).toFixed(1)}%</div>
          <span className="metric-sub">Untouched test set</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Precision</span>
            <Sparkles size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div className="metric-value">{(metrics.precision * 100).toFixed(1)}%</div>
          <span className="metric-sub">Churn class (1)</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Recall</span>
            <Layers size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div className="metric-value">{(metrics.recall * 100).toFixed(1)}%</div>
          <span className="metric-sub">Churn class (1)</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">F1 Score</span>
            <Award size={18} style={{ color: '#a855f7' }} />
          </div>
          <div className="metric-value">{(metrics.f1_score * 100).toFixed(1)}%</div>
          <span className="metric-sub">Harmonic mean</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ROC-AUC</span>
            <BrainCircuit size={18} style={{ color: '#f43f5e' }} />
          </div>
          <div className="metric-value">{(metrics.roc_auc * 100).toFixed(1)}%</div>
          <span className="metric-sub">Discriminative power</span>
        </div>
      </div>

      {/* Data & Distribution Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Churn Distribution Chart */}
        <div className="chart-card">
          <h3>Telco Dataset Churn Distribution</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Total Samples: {datasetInfo?.total_rows || 0} customers across {datasetInfo?.total_columns || 0} columns
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} customers`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dataset Summary Specs */}
        <div className="chart-card">
          <h3>Dataset Pipeline Specifications</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Excluded Feature</span>
              <strong style={{ color: '#ef4444' }}>customerID (Strictly Excluded)</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target Column</span>
              <strong>Churn (No = 0, Yes = 1)</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Numerical Preprocessing</span>
              <span>SimpleImputer(median) + StandardScaler</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Categorical Preprocessing</span>
              <span>OneHotEncoder(handle_unknown="ignore")</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Train / Test Split</span>
              <span>80% Train / 20% Test (Stratified)</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Validation Strategy</span>
              <span>5-Fold Stratified Cross Validation</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Retrain All Machine Learning Models?</h3>
            <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
              This will reload <code>my_dataset.xlsx</code>, clean whitespaces, perform a 5-fold cross-validated grid search across baseline and ensemble models, and pick the winning production model based on F1 score.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleRetrain}>
                Yes, Retrain Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
