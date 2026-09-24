import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BrainCircuit,
  BarChart3,
  GitCommit,
  Layers,
  Scale,
  Sliders,
  Sparkles,
  Database,
  GraduationCap,
  Activity,
  Server,
} from 'lucide-react';

const Sidebar = ({ healthStatus }) => {
  const isConnected = healthStatus?.status === 'ok';
  const isModelLoaded = healthStatus?.model_loaded === true;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/predict', label: 'Predict Churn', icon: BrainCircuit },
    { path: '/model-evaluation', label: 'Model Evaluation', icon: BarChart3 },
    { path: '/overfitting', label: 'Overfitting Analysis', icon: GitCommit },
    { path: '/cross-validation', label: '5-Fold CV', icon: Layers },
    { path: '/model-comparison', label: 'Model Comparison', icon: Scale },
    { path: '/hyperparameter-tuning', label: 'Tuning Lab', icon: Sliders },
    { path: '/advanced-models', label: 'Advanced Models', icon: Sparkles },
    { path: '/dataset', label: 'Dataset Insights', icon: Database },
    { path: '/about', label: 'ML Workflow & Viva', icon: GraduationCap },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo-icon">
          <Activity size={24} />
        </div>
        <div>
          <div className="brand-title">ChurnIQ</div>
          <div className="brand-subtitle">AI Churn Intelligence</div>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-item-link ${isActive ? 'active' : ''}`
                }
                end={item.path === '/'}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* Sidebar Footer with Live API Status */}
      <div className="sidebar-footer">
        <div className="status-badge-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>FastAPI Backend</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
            <span style={{ fontWeight: 600, color: isConnected ? '#34d399' : '#f87171' }}>
              {isConnected ? 'Port 8000' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="status-badge-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainCircuit size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Final Model</span>
          </div>
          <span style={{ fontWeight: 600, color: isModelLoaded ? '#34d399' : '#fbbf24' }}>
            {isModelLoaded ? 'Loaded' : 'Not Loaded'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
