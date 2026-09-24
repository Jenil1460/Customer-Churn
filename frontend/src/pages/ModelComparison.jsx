import React, { useEffect, useState } from 'react';
import { Scale, Search, ArrowUpDown, Clock, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getModelComparison } from '../services/api';

const ModelComparison = () => {
  const [comparisonTable, setComparisonTable] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('f1');
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getModelComparison();
        setComparisonTable(data || []);
      } catch (err) {
        console.error('Failed to load model comparison table', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner-box">
          <div className="spinner" />
          <p>Loading Requirement 4: Model Comparison Matrix...</p>
        </div>
      </div>
    );
  }

  // Filter and sort comparison rows
  const filteredData = comparisonTable.filter((row) =>
    row.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Chart data
  const chartData = comparisonTable.map((row) => ({
    model: row.model,
    Accuracy: Number((row.test_accuracy * 100).toFixed(1)),
    F1: Number((row.f1 * 100).toFixed(1)),
    Recall: Number((row.recall * 100).toFixed(1)),
    ROC_AUC: Number((row.roc_auc * 100).toFixed(1)),
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Requirement 4 — Compare All Machine Learning Models</h1>
        <p className="page-subtitle">
          Side-by-side performance evaluation across all 7 baseline algorithms trained on identical preprocessing pipelines
        </p>
      </div>

      {/* Comparison Chart Card */}
      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <h3>Multi-Metric Algorithm Comparison</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Comparing F1, Accuracy, Recall, and ROC-AUC metrics across models
        </p>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="model" angle={-25} textAnchor="end" interval={0} stroke="#94a3b8" />
              <YAxis domain={[40, 100]} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
              <Tooltip formatter={(val) => [`${val}%`, 'Metric']} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="F1" fill="#a855f7" radius={[4, 4, 0, 0]} name="F1 Score" />
              <Bar dataKey="Accuracy" fill="#34d399" radius={[4, 4, 0, 0]} name="Test Accuracy" />
              <Bar dataKey="Recall" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Recall" />
              <Bar dataKey="ROC_AUC" fill="#38bdf8" radius={[4, 4, 0, 0]} name="ROC-AUC" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Table Container */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Model Comparison Matrix</h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              All 7 algorithms evaluated on untouched test set
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search model name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="styled-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('model')} style={{ cursor: 'pointer' }}>
                  Model <ArrowUpDown size={12} />
                </th>
                <th onClick={() => handleSort('test_accuracy')} style={{ cursor: 'pointer' }}>
                  Test Acc <ArrowUpDown size={12} />
                </th>
                <th onClick={() => handleSort('cv_accuracy_mean')} style={{ cursor: 'pointer' }}>
                  5-Fold CV Acc <ArrowUpDown size={12} />
                </th>
                <th onClick={() => handleSort('precision')} style={{ cursor: 'pointer' }}>
                  Precision <ArrowUpDown size={12} />
                </th>
                <th onClick={() => handleSort('recall')} style={{ cursor: 'pointer' }}>
                  Recall <ArrowUpDown size={12} />
                </th>
                <th onClick={() => handleSort('f1')} style={{ cursor: 'pointer', color: '#a855f7' }}>
                  F1 Score <ArrowUpDown size={12} />
                </th>
                <th onClick={() => handleSort('roc_auc')} style={{ cursor: 'pointer' }}>
                  ROC-AUC <ArrowUpDown size={12} />
                </th>
                <th onClick={() => handleSort('train_test_gap')} style={{ cursor: 'pointer' }}>
                  Train-Test Gap <ArrowUpDown size={12} />
                </th>
                <th onClick={() => handleSort('training_time')} style={{ cursor: 'pointer' }}>
                  Fit Time <ArrowUpDown size={12} />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr key={row.model}>
                  <td>
                    <strong>{row.model}</strong>
                  </td>
                  <td>{(row.test_accuracy * 100).toFixed(1)}%</td>
                  <td>{(row.cv_accuracy_mean * 100).toFixed(1)}%</td>
                  <td>{(row.precision * 100).toFixed(1)}%</td>
                  <td>{(row.recall * 100).toFixed(1)}%</td>
                  <td style={{ fontWeight: 700, color: '#a855f7' }}>
                    {(row.f1 * 100).toFixed(1)}%
                  </td>
                  <td>{(row.roc_auc * 100).toFixed(1)}%</td>
                  <td style={{ color: row.train_test_gap > 0.05 ? '#ef4444' : '#34d399' }}>
                    {(row.train_test_gap * 100).toFixed(1)}%
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    <Clock size={12} style={{ marginRight: 4 }} />
                    {row.training_time}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModelComparison;
