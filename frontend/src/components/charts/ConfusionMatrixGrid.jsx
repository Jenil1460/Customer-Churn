import React from 'react';

const ConfusionMatrixGrid = ({ confusionMatrix }) => {
  if (!confusionMatrix || confusionMatrix.length < 2) {
    return <div style={{ color: 'var(--text-dim)', padding: '1rem' }}>No confusion matrix data available</div>;
  }

  const tn = confusionMatrix[0][0]; // True Negative
  const fp = confusionMatrix[0][1]; // False Positive
  const fn = confusionMatrix[1][0]; // False Negative
  const tp = confusionMatrix[1][1]; // True Positive

  return (
    <div>
      <div className="confusion-matrix-grid">
        {/* True Negative */}
        <div className="cm-cell tn">
          <div className="cm-number" style={{ color: 'var(--accent-emerald)' }}>{tn}</div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>True Negative (TN)</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Retained customers correctly predicted as No Churn.
          </div>
        </div>

        {/* False Positive */}
        <div className="cm-cell fp">
          <div className="cm-number" style={{ color: 'var(--accent-amber)' }}>{fp}</div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>False Positive (FP)</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Retained customers incorrectly flagged as Churn.
          </div>
        </div>

        {/* False Negative */}
        <div className="cm-cell fn">
          <div className="cm-number" style={{ color: 'var(--accent-rose)' }}>{fn}</div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>False Negative (FN)</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Churned customers missed by the model (high risk!).
          </div>
        </div>

        {/* True Positive */}
        <div className="cm-cell tp">
          <div className="cm-number" style={{ color: 'var(--accent-blue)' }}>{tp}</div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>True Positive (TP)</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Churned customers correctly identified by model.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrixGrid;
