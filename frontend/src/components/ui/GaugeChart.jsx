import React from 'react';

const GaugeChart = ({ probability = 0.0, riskLevel = 'Low' }) => {
  const percentage = Math.round(probability * 100);
  
  // SVG Gauge calculations
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = '#10b981'; // Green for Low
  if (riskLevel === 'Medium') strokeColor = '#f59e0b'; // Amber
  if (riskLevel === 'High') strokeColor = '#f43f5e'; // Rose

  return (
    <div className="gauge-container">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="rgba(255, 255, 255, 0.08)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="gauge-center-text">
        <div className="gauge-percent" style={{ color: strokeColor }}>
          {percentage}%
        </div>
        <div className="gauge-label">Probability</div>
      </div>
    </div>
  );
};

export default GaugeChart;
