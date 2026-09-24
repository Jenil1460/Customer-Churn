import React, { useEffect, useState } from 'react';
import { GitCommit, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
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
import { getOverfittingAnalysis } from '../services/api';

const getDiagnosisBadge = (diagnosis) => {
  if (diagnosis === 'Potential Overfitting') {
    return (
      <span className="badge badge-warning" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
        <AlertTriangle size={14} /> Potential Overfitting
      </span>
    );
  }
  if (diagnosis === 'Potential Underfitting') {
    return (
      <span className="badge badge-warning" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
        <AlertTriangle size={14} /> Potential Underfitting
      </span>
    );
  }
  return (
    <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
      <CheckCircle2 size={14} /> Reasonably Consistent
    </span>
  );
};

const OverfittingAnalysis = () => {
  const [overfittingData, setOverfittingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getOverfittingAnalysis();
        setOverfittingData(data);
      } catch (err) {
        console.error('Failed to load overfitting analysis', err);
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
          <p>Loading Requirement 2: Overfitting & Underfitting Analysis...</p>
        </div>
      </div>
    );
  }

  const modelNames = Object.keys(overfittingData || {});
  const chartData = modelNames.map((name) => {
    const item = overfittingData[name];
    return {
      model: name,
      Training: Number((item.training_score * 100).toFixed(1)),
      Test: Number((item.test_score * 100).toFixed(1)),
      CV: Number((item.cv_mean * 100).toFixed(1)),
    };
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Requirement 2 — Overfitting & Underfitting Diagnostic System</h1>
        <p className="page-subtitle">
          Metric-driven diagnostic analysis comparing Training Score, Test Score, and Cross-Validation Mean (Threshold: 5% gap)
        </p>
      </div>

      {/* Metric Wording Disclaimer Banner */}
      <div className="alert-card info-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <Info size={20} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Technical Diagnostic Methodology:</strong>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            A model is diagnosed with <em>"Potential Overfitting"</em> if the gap between Training Accuracy and Test/CV Accuracy exceeds 0.05 (5%). 
            Diagnoses are metric-driven estimations and not absolute proofs.
          </p>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <h3>Training vs Test vs CV Accuracy Comparison</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Visualizing accuracy gaps across all baseline models
        </p>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="model" angle={-25} textAnchor="end" interval={0} stroke="#94a3b8" />
              <YAxis domain={[40, 100]} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
              <Tooltip formatter={(val) => [`${val}%`, 'Accuracy']} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="Training" fill="#6366f1" radius={[4, 4, 0, 0]} name="Training Score" />
              <Bar dataKey="CV" fill="#38bdf8" radius={[4, 4, 0, 0]} name="5-Fold CV Mean" />
              <Bar dataKey="Test" fill="#10b981" radius={[4, 4, 0, 0]} name="Test Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cards Breakdown for Each Model */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {modelNames.map((name) => {
          const item = overfittingData[name];
          const gapPct = (item.train_test_gap * 100).toFixed(1);

          return (
            <div className="chart-card" key={name} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{name}</h4>
                  {getDiagnosisBadge(item.diagnosis)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div>
                    <span className="stat-label">Training</span>
                    <div style={{ fontWeight: 700, color: '#6366f1', fontSize: '1.1rem' }}>
                      {(item.training_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="stat-label">Test Score</span>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>
                      {(item.test_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="stat-label">CV Mean</span>
                    <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '1.1rem' }}>
                      {(item.cv_mean * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Train-Test Gap</span>
                  <strong style={{ color: item.train_test_gap > 0.05 ? '#ef4444' : '#34d399' }}>
                    {gapPct > 0 ? `+${gapPct}%` : `${gapPct}%`}
                  </strong>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: '0.5rem 0 0 0', lineHeight: '1.4' }}>
                {item.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OverfittingAnalysis;
