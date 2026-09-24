import React from 'react';
import { Sparkles, Cpu } from 'lucide-react';

const Header = () => {
  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Week 4 Logistic Regression Engine
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.9rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            fontSize: '0.8rem',
            color: '#93c5fd',
            fontWeight: 600,
          }}
        >
          <Cpu size={14} />
          Telco Churn ML
        </div>
      </div>
    </header>
  );
};

export default Header;
