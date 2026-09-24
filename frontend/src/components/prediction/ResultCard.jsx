import React from 'react';
import GaugeChart from '../ui/GaugeChart';
import { CheckCircle2, Info, ShieldAlert, Cpu } from 'lucide-react';

const ResultCard = ({ result }) => {
  if (!result) return null;

  const { prediction, churn, probability, confidence, risk_level, model_name } = result;

  const badgeClass =
    risk_level === 'High'
      ? 'badge-high'
      : risk_level === 'Medium'
      ? 'badge-medium'
      : 'badge-low';

  const isLikelyChurn = churn || prediction === 'Yes';

  return (
    <div
      className="glass-card"
      style={{
        padding: '2rem',
        border: isLikelyChurn
          ? '1px solid rgba(244, 63, 94, 0.4)'
          : '1px solid rgba(16, 185, 129, 0.4)',
        boxShadow: isLikelyChurn
          ? '0 0 35px rgba(244, 63, 94, 0.2)'
          : '0 0 35px rgba(16, 185, 129, 0.2)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
          ML Assessment Result
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem' }}>
          Customer Churn Risk
        </h2>
      </div>

      {/* Circular Gauge */}
      <GaugeChart probability={probability} riskLevel={risk_level} />

      {/* Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem', marginBottom: '1.5rem' }}>
        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.9rem', padding: '0.45rem 1.2rem' }}>
          {isLikelyChurn ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
          {risk_level} Risk Category
        </span>
      </div>

      {/* Main Prediction Details */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          border: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Prediction</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isLikelyChurn ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '0.2rem' }}>
            {isLikelyChurn ? 'Likely to Churn' : 'Unlikely to Churn'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Confidence</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {confidence}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Probability</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
            {probability}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Model Used</div>
          <div style={{ fontSize: '1.0rem', fontWeight: 700, color: '#a855f7', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Cpu size={14} />
            {model_name || 'Production Model'}
          </div>
        </div>
      </div>

      {/* Explanation Box */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem 1.25rem',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', color: '#93c5fd' }}>
          <Info size={18} /> Model Explanation
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
          {isLikelyChurn
            ? `The production ${model_name || 'model'} identified this customer profile as having a high risk of churning.`
            : `The production ${model_name || 'model'} identified this customer profile as low churn risk.`}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
