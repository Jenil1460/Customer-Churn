import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const MetricsBarChart = ({ metrics }) => {
  if (!metrics) return null;

  const data = [
    { name: 'Accuracy', value: Math.round((metrics.accuracy || 0) * 100), color: '#3b82f6' },
    { name: 'Precision', value: Math.round((metrics.precision || 0) * 100), color: '#06b6d4' },
    { name: 'Recall', value: Math.round((metrics.recall || 0) * 100), color: '#f43f5e' },
    { name: 'F1 Score', value: Math.round((metrics.f1_score || 0) * 100), color: '#a855f7' },
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Score']}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsBarChart;
