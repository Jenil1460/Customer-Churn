import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, Layers, PieChart as PieIcon, HelpCircle } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorBanner from '../components/ui/ErrorBanner';
import ChurnDonutChart from '../components/charts/ChurnDonutChart';
import { getDatasetInfo } from '../services/api';

const Dataset = () => {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDatasetData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDatasetInfo();
      setDatasetInfo(data);
    } catch (err) {
      setError('Failed to fetch dataset insights from FastAPI backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetData();
  }, []);

  if (loading) return <LoadingSkeleton height="140px" count={3} />;
  if (error) return <ErrorBanner message={error} onRetry={fetchDatasetData} />;

  const missingVals = datasetInfo?.missing_values || {};
  const numSummaries = datasetInfo?.numerical_summaries || {};

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Dataset Insights & Statistics
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Detailed breakdown of the Telco Customer Churn dataset loaded from <code style={{ color: 'var(--accent-cyan)' }}>backend/data/my_dataset.xlsx</code>.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={Database}
          value={datasetInfo?.total_rows?.toLocaleString() ?? '0'}
          label="Total Records"
          subtext="Customer rows in Excel dataset"
          color="blue"
        />
        <StatCard
          icon={Layers}
          value={datasetInfo?.total_columns ?? '0'}
          label="Total Columns"
          subtext="Features + Target"
          color="cyan"
        />
        <StatCard
          icon={FileSpreadsheet}
          value="my_dataset.xlsx"
          label="Source File"
          subtext="Processed by pandas.read_excel"
          color="emerald"
        />
      </div>

      {/* Two Column Layout: Donut Chart & Column Names */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Churn Donut */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <PieIcon size={20} style={{ color: 'var(--accent-rose)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Churn Class Distribution</h3>
          </div>
          <ChurnDonutChart churnDistribution={datasetInfo?.churn_distribution} />
        </div>

        {/* Missing Values & Column List */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <HelpCircle size={20} style={{ color: 'var(--accent-amber)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Dataset Missing Values</h3>
          </div>

          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Column Name</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Missing Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(missingVals).map(([col, count]) => (
                  <tr key={col} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: 500 }}>{col}</td>
                    <td style={{ padding: '0.5rem 0.8rem', textAlign: 'right', color: count > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 600 }}>
                      {count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Numerical Feature Summaries Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Database size={20} style={{ color: 'var(--accent-blue)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Numerical Feature Summary Statistics</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.8rem 1rem' }}>Metric</th>
                {Object.keys(numSummaries).map((feature) => (
                  <th key={feature} style={{ padding: '0.8rem 1rem' }}>{feature}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'].map((stat) => (
                <tr key={stat} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.7rem 1rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    {stat}
                  </td>
                  {Object.keys(numSummaries).map((feature) => (
                    <td key={`${feature}-${stat}`} style={{ padding: '0.7rem 1rem' }}>
                      {numSummaries[feature]?.[stat] ?? 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dataset;
