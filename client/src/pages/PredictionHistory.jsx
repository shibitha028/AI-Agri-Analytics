import { useEffect, useState } from 'react';
import { getScenarioHistory } from '../services/agriService';
import { getErrorMessage } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RiskBadge from '../components/RiskBadge.jsx';
import ResultTypeBadge from '../components/ResultTypeBadge.jsx';

export default function PredictionHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getScenarioHistory()
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Prediction / Scenario History</h1>
          <p>Every Climate Simulator run you've performed, stored for reference. These are scenario simulations, not ML predictions.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader />
      ) : !data.length ? (
        <EmptyState icon="🕒" title="No scenario history yet" description="Run a simulation in the Climate Simulator to see it appear here." />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th><th>District</th><th>Crop</th><th>Input Conditions</th>
                  <th>Estimated Yield</th><th>Risk</th><th>Type</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s) => (
                  <tr key={s._id}>
                    <td>{new Date(s.date || s.createdAt).toLocaleDateString()}</td>
                    <td>{s.district}</td>
                    <td>{s.crop}</td>
                    <td>
                      Rain {s.inputConditions.rainfallChangePercent > 0 ? '+' : ''}{s.inputConditions.rainfallChangePercent}%,{' '}
                      Temp {s.inputConditions.temperatureChangeC > 0 ? '+' : ''}{s.inputConditions.temperatureChangeC}°C,{' '}
                      Humidity {s.inputConditions.humidityChangePercent > 0 ? '+' : ''}{s.inputConditions.humidityChangePercent}%
                    </td>
                    <td>{s.estimatedYield} t/ha</td>
                    <td><RiskBadge level={s.riskLevel} /></td>
                    <td><ResultTypeBadge type={s.resultType} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
