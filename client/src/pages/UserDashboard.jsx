import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/agriService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import StatCard from '../components/StatCard.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function UserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDashboard(user?.district)
      .then((res) => mounted && setData(res))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [user?.district]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Hello, {user?.name} 👋</h1>
          <p>District: {user?.district || 'Not set'}{user?.state ? `, ${user.state}` : ''}</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader label="Loading your personalized dashboard..." />
      ) : !data ? (
        <EmptyState title="No dashboard data available" />
      ) : (
        <>
          {data.smartAgriInsight && (
            <div className="insight-banner">
              <span className="icon">🌱</span>
              <div>
                <h4>Smart Agri Insight</h4>
                <p>{data.smartAgriInsight}</p>
              </div>
            </div>
          )}

          <div className="stat-grid">
            <StatCard icon="📚" label="Total Historical Records" value={data.cards.totalHistoricalRecords} />
            <StatCard icon="🌧️" label="Average Rainfall" value={data.cards.averageRainfall} suffix="mm" />
            <StatCard icon="🌾" label="Average Yield" value={data.cards.averageYield} suffix="t/ha" />
            <StatCard icon="🧪" label="Soil Health Score" value={data.cards.soilHealthScore ?? '—'} suffix={data.cards.soilHealthScore ? '/100' : ''} />
            <StatCard icon="🌱" label="Available Crops" value={data.cards.availableCrops} />
            <StatCard icon="🗺️" label="Available Districts" value={data.cards.availableDistricts} />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-title">🌾 Crops with Historical Records</div>
              {data.cropsList?.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.cropsList.map((c) => (
                    <span key={c} className="badge badge-historical">{c}</span>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🌾" title="No crop records yet" description="Ask an admin to upload agricultural data for your district." />
              )}
            </div>

            <div className="card">
              <div className="card-title">📍 Quick Actions</div>
              <p className="text-muted mb-2" style={{ fontSize: 13.5 }}>
                Explore rainfall trends, run a climate scenario, or ask the AI Farming Assistant a question.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link className="btn btn-secondary" to="/rainfall-analytics">🌧️ View Rainfall Analytics</Link>
                <Link className="btn btn-secondary" to="/climate-simulator">🌡️ Run Climate Simulation</Link>
                <Link className="btn btn-secondary" to="/ai-assistant">🤖 Ask AI Farming Assistant</Link>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
