import React, { useEffect, useState } from 'react';
import { Layers, Info, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getCrossValidation } from '../services/api';

const CrossValidation = () => {
  const [cvData, setCvData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('f1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCrossValidation();
        setCvData(data);
      } catch (err) {
        console.error('Failed to load cross-validation data', err);
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
          <p>Loading Requirement 3: 5-Fold Stratified Cross-Validation...</p>
        </div>
      </div>
    );
  }

  const modelNames = Object.keys(cvData || {});

  // Construct chart dataset for selected metric
  const chartData = modelNames.map((name) => {
    const metricObj = cvData[name]?.[selectedMetric] || { folds: [], mean: 0, std: 0 };
    return {
      model: name,
      Fold_1: Number((metricObj.folds[0] * 100).toFixed(1)),
      Fold_2: Number((metricObj.folds[1] * 100).toFixed(1)),
      Fold_3: Number((metricObj.folds[2] * 100).toFixed(1)),
      Fold_4: Number((metricObj.folds[3] * 100).toFixed(1)),
      Fold_5: Number((metricObj.folds[4] * 100).toFixed(1)),
      Mean: Number((metricObj.mean * 100).toFixed(1)),
      Std: Number((metricObj.std * 100).toFixed(2)),
    };
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Requirement 3 — 5-Fold Stratified Cross-Validation</h1>
        <p className="page-subtitle">
          Evaluated strictly on training data using <code>StratifiedKFold(n_splits=5, shuffle=True, random_state=42)</code>
        </p>
      </div>

      {/* Info Banner */}
      <div className="alert-card info-card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Info size={18} style={{ color: '#38bdf8' }} />
        <span>
          <strong>Data Leakage Prevention:</strong> All 5-fold cross-validations were performed strictly on training data (<code>X_train</code>). The final test set remained untouched.
        </span>
      </div>

      {/* Metric Selector Tabs */}
      <div className="tab-group" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        {[
          { key: 'f1', label: 'F1 Score (Primary)' },
          { key: 'accuracy', label: 'Accuracy' },
          { key: 'precision', label: 'Precision' },
          { key: 'recall', label: 'Recall' },
          { key: 'roc_auc', label: 'ROC-AUC' },
        ].map((m) => (
          <button
            key={m.key}
            className={`btn-tab ${selectedMetric === m.key ? 'active' : ''}`}
            onClick={() => setSelectedMetric(m.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: selectedMetric === m.key ? '1px solid #6366f1' : '1px solid var(--border-color)',
              background: selectedMetric === m.key ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: selectedMetric === m.key ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 5-Fold Chart */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <h3>5-Fold Metric Comparison ({selectedMetric.toUpperCase()})</h3>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="model" angle={-25} textAnchor="end" interval={0} stroke="#94a3b8" />
              <YAxis domain={[40, 100]} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
              <Tooltip formatter={(val) => [`${val}%`, 'Value']} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Fold_1" fill="#6366f1" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Fold_2" fill="#38bdf8" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Fold_3" fill="#34d399" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Fold_4" fill="#fbbf24" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Fold_5" fill="#a855f7" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5-Fold Detailed Results Matrix Table */}
      <div className="chart-card">
        <h3>5-Fold Cross-Validation Matrix Table</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Exact per-fold score distribution and variance across all 5 folds
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Fold 1</th>
                <th>Fold 2</th>
                <th>Fold 3</th>
                <th>Fold 4</th>
                <th>Fold 5</th>
                <th style={{ color: '#38bdf8' }}>Mean ({selectedMetric.toUpperCase()})</th>
                <th style={{ color: '#fbbf24' }}>Std Dev</th>
              </tr>
            </thead>
            <tbody>
              {modelNames.map((name) => {
                const metricObj = cvData[name]?.[selectedMetric] || { folds: [0, 0, 0, 0, 0], mean: 0, std: 0 };
                return (
                  <tr key={name}>
                    <td><strong>{name}</strong></td>
                    {metricObj.folds.map((val, idx) => (
                      <td key={idx}>{(val * 100).toFixed(1)}%</td>
                    ))}
                    <td style={{ fontWeight: 700, color: '#38bdf8' }}>
                      {(metricObj.mean * 100).toFixed(1)}%
                    </td>
                    <td style={{ color: '#fbbf24' }}>
                      ±{(metricObj.std * 100).toFixed(2)}%
                    </td>
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

export default CrossValidation;
