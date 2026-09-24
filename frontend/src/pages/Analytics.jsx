import React, { useState, useEffect } from 'react';
import { BarChart3, Award, Target, Activity, Zap, Grid, FileText, RefreshCw } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorBanner from '../components/ui/ErrorBanner';
import MetricsBarChart from '../components/charts/MetricsBarChart';
import ConfusionMatrixGrid from '../components/charts/ConfusionMatrixGrid';
import { getMetrics, retrainModel } from '../services/api';

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retraining, setRetraining] = useState(false);

  const fetchMetricsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Failed to load model analytics metrics from FastAPI backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsData();
  }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      await retrainModel();
      await fetchMetricsData();
    } catch (err) {
      alert('Retraining failed: ' + (err?.response?.data?.detail || err.message));
    } finally {
      setRetraining(false);
    }
  };

  if (loading) return <LoadingSkeleton height="140px" count={3} />;
  if (error) return <ErrorBanner message={error} onRetry={fetchMetricsData} />;

  const accuracyPct = metrics?.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : 'N/A';
  const precisionPct = metrics?.precision ? `${(metrics.precision * 100).toFixed(1)}%` : 'N/A';
  const recallPct = metrics?.recall ? `${(metrics.recall * 100).toFixed(1)}%` : 'N/A';
  const f1Pct = metrics?.f1_score ? `${(metrics.f1_score * 100).toFixed(1)}%` : 'N/A';

  const report = metrics?.classification_report || {};

  return (
    <div>
      {/* Page Title & Retrain Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Model Performance & Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Evaluation metrics computed on 20% stratified test set using scikit-learn.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleRetrain}
          disabled={retraining}
          style={{ gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={retraining ? 'animate-spin' : ''} />
          {retraining ? 'Retraining Model...' : 'Retrain Model'}
        </button>
      </div>

      {/* Metrics Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={Award}
          value={accuracyPct}
          label="Accuracy"
          subtext="Correct predictions / Total"
          color="emerald"
        />
        <StatCard
          icon={Target}
          value={precisionPct}
          label="Precision (Churn = Yes)"
          subtext="True Churn / Predicted Churn"
          color="cyan"
        />
        <StatCard
          icon={Activity}
          value={recallPct}
          label="Recall (Churn = Yes)"
          subtext="True Churn / Actual Churners"
          color="amber"
        />
        <StatCard
          icon={Zap}
          value={f1Pct}
          label="F1 Score"
          subtext="Harmonic balance"
          color="purple"
        />
      </div>

      {/* Two Column Layout: Bar Chart & Confusion Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Metrics Comparison Bar Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <BarChart3 size={20} style={{ color: 'var(--accent-blue)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Metrics Comparison</h3>
          </div>
          <MetricsBarChart metrics={metrics} />
        </div>

        {/* Confusion Matrix */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Grid size={20} style={{ color: 'var(--accent-indigo)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Confusion Matrix (2x2)</h3>
          </div>
          <ConfusionMatrixGrid confusionMatrix={metrics?.confusion_matrix} />
        </div>
      </div>

      {/* Classification Report Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <FileText size={20} style={{ color: 'var(--accent-purple)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Classification Report</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.8rem 1rem' }}>Class</th>
                <th style={{ padding: '0.8rem 1rem' }}>Precision</th>
                <th style={{ padding: '0.8rem 1rem' }}>Recall</th>
                <th style={{ padding: '0.8rem 1rem' }}>F1-Score</th>
                <th style={{ padding: '0.8rem 1rem' }}>Support (Test Count)</th>
              </tr>
            </thead>
            <tbody>
              {['No Churn (0)', 'Churn (1)'].map((clsKey) => {
                const clsData = report[clsKey] || {};
                return (
                  <tr key={clsKey} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: clsKey.includes('Churn (1)') ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                      {clsKey}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>{clsData.precision ? `${(clsData.precision * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>{clsData.recall ? `${(clsData.recall * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>{clsData['f1-score'] ? `${(clsData['f1-score'] * 100).toFixed(1)}%` : 'N/A'}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>{clsData.support ?? 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
