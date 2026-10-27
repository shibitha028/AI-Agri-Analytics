import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getFilterOptions, getRainfallAnalytics, getCropAnalytics } from '../../services/agriService';
import { getErrorMessage } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import FiltersBar from '../../components/FiltersBar.jsx';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';

export default function AdminAnalytics() {
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({});
  const [rainfall, setRainfall] = useState(null);
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getRainfallAnalytics(filters), getCropAnalytics(filters)])
      .then(([r, c]) => { if (mounted) { setRainfall(r); setCrop(c); } })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [filters]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Platform-wide analytics across all districts and datasets.</p>
        </div>
      </div>

      <FiltersBar filters={filters} onChange={setFilters} options={options} fields={['district', 'year', 'crop', 'season']} />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader />
      ) : (
        <div className="grid-2">
          <div className="card">
            <div className="card-title">📈 Year-wise Rainfall (All Districts)</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={rainfall?.yearWise || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef3ee" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="averageRainfall" stroke="#2d5fd6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-title">🌾 Crop Comparison (Avg Production)</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={crop?.cropComparison || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef3ee" />
                <XAxis dataKey="crop" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="averageProduction" fill="#3fb463" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
