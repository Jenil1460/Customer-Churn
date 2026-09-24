import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Award, Sparkles, Layers, ShieldCheck, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { getModelEvaluation, getRocCurve, getPrecisionRecall } from '../services/api';

const ModelEvaluation = () => {
  const [evaluation, setEvaluation] = useState(null);
  const [rocData, setRocData] = useState(null);
  const [prData, setPrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [evalRes, rocRes, prRes] = await Promise.all([
          getModelEvaluation(),
          getRocCurve().catch(() => null),
          getPrecisionRecall().catch(() => null),
        ]);
        setEvaluation(evalRes);
        setRocData(rocRes);
        setPrData(prRes);
      } catch (err) {
        console.error('Failed to load evaluation metrics', err);
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
          <p>Loading Requirement 1: Model Evaluation Metrics...</p>
        </div>
      </div>
    );
  }

  const metrics = evaluation?.final_test_metrics || {};
  const cm = metrics.confusion_matrix || {};
  const report = metrics.classification_report || {};

  // Construct chart dataset for ROC curve
  const selectedModelName = evaluation?.final_model_name?.split(' ')[0] || 'Logistic Regression';
  const rocPoints = rocData?.[selectedModelName] || rocData?.['Logistic Regression'] || {};
  const rocChartData = (rocPoints.fpr || []).map((fprVal, idx) => ({
    fpr: fprVal,
    tpr: rocPoints.tpr?.[idx] || 0,
  }));

  // Construct chart dataset for Precision-Recall curve
  const prPoints = prData?.[selectedModelName] || prData?.['Logistic Regression'] || {};
  const prChartData = (prPoints.recall || []).map((recVal, idx) => ({
    recall: recVal,
    precision: prPoints.precision?.[idx] || 0,
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Requirement 1 — Model Evaluation Dashboard</h1>
        <p className="page-subtitle">
          Comprehensive evaluation of the final selected model on the untouched test set using real sklearn metrics
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Test Accuracy</span>
            <CheckCircle2 size={18} style={{ color: '#34d399' }} />
          </div>
          <div className="metric-value">{(metrics.accuracy * 100).toFixed(1)}%</div>
          <span className="metric-sub">Overall correct ratio</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Precision</span>
            <Sparkles size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div className="metric-value">{(metrics.precision * 100).toFixed(1)}%</div>
          <span className="metric-sub">Churn Class (1)</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Recall</span>
            <Layers size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div className="metric-value">{(metrics.recall * 100).toFixed(1)}%</div>
          <span className="metric-sub">Sensitivity (True Positives)</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">F1 Score</span>
            <Award size={18} style={{ color: '#a855f7' }} />
          </div>
          <div className="metric-value">{(metrics.f1_score * 100).toFixed(1)}%</div>
          <span className="metric-sub">Primary selection metric</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ROC-AUC</span>
            <BarChart3 size={18} style={{ color: '#f43f5e' }} />
          </div>
          <div className="metric-value">{(metrics.roc_auc * 100).toFixed(1)}%</div>
          <span className="metric-sub">Area under ROC curve</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Specificity</span>
            <ShieldCheck size={18} style={{ color: '#10b981' }} />
          </div>
          <div className="metric-value">{((metrics.specificity || 0) * 100).toFixed(1)}%</div>
          <span className="metric-sub">True Negative Rate</span>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Balanced Accuracy</span>
            <Activity size={18} style={{ color: '#6366f1' }} />
          </div>
          <div className="metric-value">{((metrics.balanced_accuracy || 0) * 100).toFixed(1)}%</div>
          <span className="metric-sub">(Sensitivity + Specificity) / 2</span>
        </div>
      </div>

      {/* Confusion Matrix & Classification Report Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Confusion Matrix Card */}
        <div className="chart-card">
          <h3>Confusion Matrix</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Breakdown of true vs predicted values on untouched test data
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>True Negative (TN)</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>
                {cm.true_negative ?? 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correctly predicted No Churn</span>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>False Positive (FP)</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444', marginTop: '0.25rem' }}>
                {cm.false_positive ?? 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>False Alarm (Predicted Churn)</span>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>False Negative (FN)</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.25rem' }}>
                {cm.false_negative ?? 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Missed Churn (Dangerous)</span>
            </div>

            <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>True Positive (TP)</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#6366f1', marginTop: '0.25rem' }}>
                {cm.true_positive ?? 0}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correctly predicted Churn</span>
            </div>
          </div>
        </div>

        {/* Classification Report Card */}
        <div className="chart-card">
          <h3>Classification Report</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Detailed breakdown by target class from sklearn <code>classification_report</code>
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1-Score</th>
                  <th>Support</th>
                </tr>
              </thead>
              <tbody>
                {['No Churn (0)', 'Churn (1)'].map((clsKey) => {
                  const item = report[clsKey] || {};
                  return (
                    <tr key={clsKey}>
                      <td><strong>{clsKey}</strong></td>
                      <td>{((item.precision || 0) * 100).toFixed(1)}%</td>
                      <td>{((item.recall || 0) * 100).toFixed(1)}%</td>
                      <td>{((item['f1-score'] || 0) * 100).toFixed(1)}%</td>
                      <td>{item.support || 0}</td>
                    </tr>
                  );
                })}
                {report['macro avg'] && (
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                    <td><em>Macro Average</em></td>
                    <td>{(report['macro avg'].precision * 100).toFixed(1)}%</td>
                    <td>{(report['macro avg'].recall * 100).toFixed(1)}%</td>
                    <td>{(report['macro avg']['f1-score'] * 100).toFixed(1)}%</td>
                    <td>{report['macro avg'].support}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ROC & PR Curves Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* ROC Curve */}
        <div className="chart-card">
          <h3>ROC Curve (Receiver Operating Characteristic)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            True Positive Rate (TPR) vs False Positive Rate (FPR) (AUC = {((metrics.roc_auc || 0) * 100).toFixed(1)}%)
          </p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={rocChartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="fpr" type="number" domain={[0, 1]} label={{ value: 'False Positive Rate (FPR)', position: 'bottom', offset: 0, fill: '#94a3b8' }} />
                <YAxis dataKey="tpr" type="number" domain={[0, 1]} label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'left', fill: '#94a3b8' }} />
                <Tooltip formatter={(val) => [val, 'Value']} />
                <Line type="monotone" dataKey="tpr" stroke="#6366f1" strokeWidth={3} dot={false} name="Model ROC" />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#64748b" strokeDasharray="5 5" label="Random Classifier" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PR Curve */}
        <div className="chart-card">
          <h3>Precision-Recall Curve</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Precision vs Recall trade-off across classification confidence thresholds
          </p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={prChartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="recall" type="number" domain={[0, 1]} label={{ value: 'Recall', position: 'bottom', offset: 0, fill: '#94a3b8' }} />
                <YAxis dataKey="precision" type="number" domain={[0, 1]} label={{ value: 'Precision', angle: -90, position: 'left', fill: '#94a3b8' }} />
                <Tooltip formatter={(val) => [val, 'Value']} />
                <Line type="monotone" dataKey="precision" stroke="#38bdf8" strokeWidth={3} dot={false} name="PR Curve" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelEvaluation;
