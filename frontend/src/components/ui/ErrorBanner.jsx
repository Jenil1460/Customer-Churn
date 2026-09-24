import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorBanner = ({ message, onRetry }) => {
  return (
    <div
      className="glass-card"
      style={{
        borderLeft: '4px solid var(--accent-rose)',
        background: 'rgba(244, 63, 94, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.2rem 1.5rem',
        margin: '1rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <AlertTriangle size={24} style={{ color: 'var(--accent-rose)' }} />
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fecdd3' }}>
            Service Error
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {message || 'Could not connect to backend ML service.'}
          </div>
        </div>
      </div>

      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
