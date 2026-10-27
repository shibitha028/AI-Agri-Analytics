import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getFilterOptions, getWaterResourceSummary } from '../services/agriService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import StatCard from '../components/StatCard.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ResultTypeBadge from '../components/ResultTypeBadge.jsx';

export default function WaterResources() {
  const { user } = useAuth();
  const [options, setOptions] = useState({});
  const [district, setDistrict] = useState(user?.district || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {});
  }, []);

  useEffect(() => {
    if (!district) {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    setError('');
    getWaterResourceSummary(district)
      .then((res) => mounted && setData(res.data))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [district]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>💧 Water Resources</h1>
          <p>Rivers, ponds, lakes and reservoirs — and how much water they store across seasons.</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="form-group">
          <label className="form-label">District</label>
          <select className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">Select District</option>
            {(options.districts || []).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {!district ? (
        <EmptyState icon="💧" title="Select a district" description="Choose a district above to view its water resource data." />
      ) : loading ? (
        <Loader label="Loading water resource data..." />
      ) : !data ? (
        <EmptyState icon="💧" title="No water resource data available" description="Ask an admin to upload water resource data for this district." />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard icon="🏞️" label="Rivers" value={data.waterBodies.rivers} />
            <StatCard icon="🌊" label="Ponds" value={data.waterBodies.ponds} />
            <StatCard icon="🛶" label="Lakes" value={data.waterBodies.lakes} />
            <StatCard icon="🚰" label="Reservoirs" value={data.waterBodies.reservoirs} />
            <StatCard icon="📦" label="Total Storage Capacity" value={data.totalStorageCapacityMCM} suffix="MCM" />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="flex-between mb-2">
                <div className="card-title" style={{ marginBottom: 0 }}>📊 Season-wise Average Storage</div>
                <ResultTypeBadge type="Analytics-Based Estimate" />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.seasonWiseAvgStorage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef3ee" />
                  <XAxis dataKey="season" fontSize={12} />
                  <YAxis fontSize={12} unit="%" />
                  <Tooltip />
                  <Bar dataKey="averageStoragePercent" name="Avg Storage Filled (%)" fill="#2d9cdb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-title">📈 Storage % vs Rainfall (Year-wise)</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.yearWise}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef3ee" />
                  <XAxis dataKey="year" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="storagePercentage" name="Storage Filled (%)" stroke="#2d9cdb" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="rainfallMM" name="Rainfall (mm)" stroke="#1a7d3a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-title">📋 Year & Season-wise Records</div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Year</th><th>Season</th><th>Storage Filled</th><th>Current Storage</th><th>Rainfall</th></tr>
                </thead>
                <tbody>
                  {data.yearWise.map((r, i) => (
                    <tr key={i}>
                      <td>{r.year}</td>
                      <td>{r.season}</td>
                      <td>{r.storagePercentage}%</td>
                      <td>{r.currentStorageMCM} MCM</td>
                      <td>{r.rainfallMM ?? '—'} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-muted mt-2" style={{ fontSize: 12.5 }}>
            Storage percentage is an Analytics-Based Estimate calculated from recorded capacity and
            current storage — not a machine learning prediction.
          </p>
        </>
      )}
    </DashboardLayout>
  );
}
