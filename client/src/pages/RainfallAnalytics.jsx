import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getFilterOptions, getRainfallAnalytics } from '../services/agriService';
import { getErrorMessage } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import FiltersBar from '../components/FiltersBar.jsx';
import StatCard from '../components/StatCard.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function RainfallAnalytics() {
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
    getRainfallAnalytics(filters)
      .then((res) => mounted && setData(res))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [filters]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Rainfall Analytics</h1>
          <p>Interactive rainfall trends derived from historical MongoDB records.</p>
        </div>
      </div>

      <FiltersBar filters={filters} onChange={setFilters} options={options} fields={['district', 'year', 'season']} />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader />
      ) : !data || !data.recordCount ? (
        <EmptyState title="No rainfall records match these filters" />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard icon="🌧️" label="Average Rainfall" value={data.summary.average} suffix="mm" />
            <StatCard icon="⬆️" label="Highest Rainfall" value={data.summary.highest} suffix="mm" />
            <StatCard icon="⬇️" label="Lowest Rainfall" value={data.summary.lowest} suffix="mm" />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-title">📈 Year-wise Rainfall</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.yearWise}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef3ee" />
                  <XAxis dataKey="year" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="averageRainfall" stroke="#2d5fd6" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-title">📊 District-wise Rainfall</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.districtWise}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef3ee" />
                  <XAxis dataKey="district" fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="averageRainfall" fill="#5a8fd6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-muted mt-2" style={{ fontSize: 12.5 }}>
            Note: Monthly rainfall breakdown requires month-level fields in the dataset. Current records are stored at yearly granularity.
          </p>
        </>
      )}
    </DashboardLayout>
  );
}
