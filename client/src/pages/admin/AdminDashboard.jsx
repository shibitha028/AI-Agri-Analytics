import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../services/agriService';
import { getErrorMessage } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import StatCard from '../../components/StatCard.jsx';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminDashboard()
      .then((res) => setData(res.cards))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform-wide overview of users, datasets and records.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="stat-grid">
            <StatCard icon="👥" label="Total Users" value={data.totalUsers} />
            <StatCard icon="📚" label="Total Records" value={data.totalRecords} />
            <StatCard icon="🗺️" label="Total Districts" value={data.totalDistricts} />
            <StatCard icon="🌾" label="Total Crops" value={data.totalCrops} />
            <StatCard icon="📁" label="Total Datasets" value={data.totalDatasets} />
            <StatCard icon="🟢" label="System Status" value={data.systemStatus} />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-title">⬆️ Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link className="btn btn-secondary" to="/admin/dataset-upload">📤 Upload New Dataset</Link>
                <Link className="btn btn-secondary" to="/admin/users">👥 View Registered Users</Link>
                <Link className="btn btn-secondary" to="/admin/upload-history">🕒 View Upload History</Link>
              </div>
            </div>
            <div className="card">
              <div className="card-title">ℹ️ Platform Notes</div>
              <p className="text-muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                This platform uses rule-based analytics and scenario simulation derived from historical data —
                it does not use any machine learning model. All estimates are clearly labeled as
                "Analytics-Based Estimate" or "Scenario Simulation".
              </p>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
