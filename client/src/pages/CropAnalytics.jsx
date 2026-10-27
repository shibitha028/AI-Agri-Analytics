import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getFilterOptions, getCropAnalytics } from '../services/agriService';
import { getErrorMessage } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import FiltersBar from '../components/FiltersBar.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ResultTypeBadge from '../components/ResultTypeBadge.jsx';

export default function CropAnalytics() {
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
    getCropAnalytics(filters)
      .then((res) => mounted && setData(res))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [filters]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Crop Analytics</h1>
          <p>Compare crops, districts and years using real historical records from MongoDB.</p>
        </div>
      </div>

      <FiltersBar filters={filters} onChange={setFilters} options={options} fields={['district', 'year', 'crop', 'season']} />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader />
      ) : !data || !data.records.length ? (
        <EmptyState title="No crop records match these filters" />
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-title">🌾 Crop Comparison — Average Production & Historical Yield</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.cropComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef3ee" />
                <XAxis dataKey="crop" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageProduction" name="Avg Production (t)" fill="#3fb463" radius={[6, 6, 0, 0]} />
                <Bar dataKey="averageHistoricalYield" name="Avg Historical Yield (t/ha)" fill="#f2a71b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-title">📋 Crop Records ({data.recordCount})</div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Crop</th><th>District</th><th>Year</th><th>Season</th>
                    <th>Area (ha)</th><th>Production (t)</th><th>Yield (t/ha)</th><th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.slice(0, 60).map((r) => (
                    <tr key={r._id}>
                      <td>{r.crop}</td>
                      <td>{r.district}</td>
                      <td>{r.year}</td>
                      <td>{r.season}</td>
                      <td>{r.area ?? '—'}</td>
                      <td>{r.production ?? '—'}</td>
                      <td>{r.yield ?? '—'}</td>
                      <td><ResultTypeBadge type="Historical Yield" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
