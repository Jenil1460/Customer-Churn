import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ChurnDonutChart = ({ churnDistribution }) => {
  if (!churnDistribution || Object.keys(churnDistribution).length === 0) {
    return <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>No distribution data available</div>;
  }

  const noChurnCount = churnDistribution['No'] || churnDistribution[0] || 0;
  const churnCount = churnDistribution['Yes'] || churnDistribution[1] || 0;
  const total = noChurnCount + churnCount;

  const data = [
    { name: 'Retained (No Churn)', value: noChurnCount, color: '#10b981' },
    { name: 'Churned (Yes)', value: churnCount, color: '#f43f5e' },
  ];

  const churnPercentage = total > 0 ? ((churnCount / total) * 100).toFixed(1) : 0;

  return (
    <div style={{ width: '100%', height: 300, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          top: '44%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>{churnPercentage}%</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Churn Rate</div>
      </div>
    </div>
  );
};

export default ChurnDonutChart;
