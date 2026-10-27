import { useEffect, useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { getFilterOptions, getSoilAnalytics } from '../services/agriService';
import { getErrorMessage } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import FiltersBar from '../components/FiltersBar.jsx';
import StatCard from '../components/StatCard.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ResultTypeBadge from '../components/ResultTypeBadge.jsx';

export default function SoilHealth() {
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getSoilAnalytics(filters)
      .then((res) => mounted && setData(res))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [filters]);

  const radarData = data ? [
    { metric: 'Nitrogen', value: data.averages.nitrogen },
    { metric: 'Phosphorus', value: data.averages.phosphorus },
    { metric: 'Potassium', value: data.averages.potassium },
    { metric: 'pH (x10)', value: +(data.averages.ph * 10).toFixed(1) }
  ] : [];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Soil Health</h1>
          <p>Analytics-based soil health scoring from Nitrogen, Phosphorus, Potassium and pH records.</p>
        </div>
      </div>

      <FiltersBar filters={filters} onChange={setFilters} options={options} fields={['district', 'year', 'crop']} />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader />
      ) : !data || !data.records.length ? (
        <EmptyState title="No soil records match these filters" />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard icon="🧪" label="Nitrogen (N)" value={data.averages.nitrogen} />
            <StatCard icon="🧪" label="Phosphorus (P)" value={data.averages.phosphorus} />
            <StatCard icon="🧪" label="Potassium (K)" value={data.averages.potassium} />
            <StatCard icon="⚗️" label="pH Level" value={data.averages.ph} />
            <StatCard icon="🌱" label="Soil Health Score" value={data.averages.soilHealthScore} suffix="/100" />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="flex-between mb-2">
                <div className="card-title" style={{ marginBottom: 0 }}>🕸️ Nutrient Profile (Radar)</div>
                <ResultTypeBadge type="Analytics-Based Estimate" />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" fontSize={12} />
                  <PolarRadiusAxis fontSize={10} />
                  <Radar dataKey="value" stroke="#1a7d3a" fill="#3fb463" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-title">📋 Soil Records</div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>District</th><th>Year</th><th>Crop</th><th>N</th><th>P</th><th>K</th><th>pH</th><th>Score</th></tr>
                  </thead>
                  <tbody>
                    {data.records.slice(0, 30).map((r, i) => (
                      <tr key={i}>
                        <td>{r.district}</td><td>{r.year}</td><td>{r.crop}</td>
                        <td>{r.nitrogen ?? '—'}</td><td>{r.phosphorus ?? '—'}</td>
                        <td>{r.potassium ?? '—'}</td><td>{r.ph ?? '—'}</td>
                        <td><strong>{r.soilHealthScore}</strong>/100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <p className="text-muted mt-2" style={{ fontSize: 12.5 }}>
            Soil Health Score is calculated using rule-based scoring against agronomic reference ranges. It is an
            Analytics-Based Estimate — not a machine learning prediction, and no confidence score is fabricated.
          </p>
        </>
      )}
    </DashboardLayout>
  );
}
