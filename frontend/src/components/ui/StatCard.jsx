import React from 'react';

const StatCard = ({ icon: Icon, value, label, subtext, color = 'blue' }) => {
  const colorMap = {
    blue: { bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' },
    emerald: { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399' },
    amber: { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' },
    purple: { bg: 'rgba(168, 85, 247, 0.12)', color: '#c084fc' },
    cyan: { bg: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee' },
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="glass-card stat-card">
      <div className="stat-icon-wrapper" style={{ background: style.bg, color: style.color }}>
        {Icon && <Icon size={26} />}
      </div>
      <div>
        <div className="stat-value">{value ?? 'N/A'}</div>
        <div className="stat-label">{label}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
    </div>
  );
};

export default StatCard;
