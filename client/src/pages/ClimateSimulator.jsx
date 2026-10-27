import { useEffect, useState } from 'react';
import { getFilterOptions, runSimulation } from '../services/agriService';
import { getErrorMessage } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Alert from '../components/Alert.jsx';
import ResultTypeBadge from '../components/ResultTypeBadge.jsx';
import RiskBadge from '../components/RiskBadge.jsx';

export default function ClimateSimulator() {
  const [options, setOptions] = useState({});
  const [district, setDistrict] = useState('');
  const [crop, setCrop] = useState('');
  const [rainfall, setRainfall] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {});
  }, []);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!district || !crop) {
      setError('Please select a district and crop.');
      return;
    }

    setLoading(true);
    try {
      const res = await runSimulation({
        district,
        crop,
        rainfallChangePercent: rainfall,
        temperatureChangeC: temperature,
        humidityChangePercent: humidity
      });
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Climate Change Simulator</h1>
          <p>A transparent, rule-based scenario simulation — not a machine-learning prediction.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="grid-2">
        <div className="card">
          <div className="card-title">⚙️ Scenario Inputs</div>
          <form onSubmit={handleSimulate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">District</label>
                <select className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)} required>
                  <option value="">Select District</option>
                  {(options.districts || []).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Crop</label>
                <select className="form-select" value={crop} onChange={(e) => setCrop(e.target.value)} required>
                  <option value="">Select Crop</option>
                  {(options.crops || []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="slider-row">
              <div className="slider-label"><span>Rainfall Change</span><span>{rainfall > 0 ? '+' : ''}{rainfall}%</span></div>
              <input type="range" min={-50} max={50} value={rainfall} onChange={(e) => setRainfall(+e.target.value)} />
            </div>

            <div className="slider-row">
              <div className="slider-label"><span>Temperature Change</span><span>{temperature > 0 ? '+' : ''}{temperature}°C</span></div>
              <input type="range" min={-5} max={5} step={0.5} value={temperature} onChange={(e) => setTemperature(+e.target.value)} />
            </div>

            <div className="slider-row">
              <div className="slider-label"><span>Humidity Change</span><span>{humidity > 0 ? '+' : ''}{humidity}%</span></div>
              <input type="range" min={-30} max={30} value={humidity} onChange={(e) => setHumidity(+e.target.value)} />
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : '▶ Run Scenario Simulation'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="flex-between mb-2">
            <div className="card-title" style={{ marginBottom: 0 }}>📊 Simulation Result</div>
            {result && <ResultTypeBadge type="Scenario Simulation" />}
          </div>

          {!result ? (
            <p className="text-muted" style={{ fontSize: 14 }}>Run a simulation to see the estimated impact on historical yield.</p>
          ) : (
            <div className="result-panel">
              <div className="result-row"><span>Current Value (Historical Avg. Yield)</span><strong>{result.currentValue} t/ha</strong></div>
              <div className="result-row"><span>Simulated Value</span><strong>{result.simulatedValue} t/ha</strong></div>
              <div className="result-row"><span>Difference</span><strong>{result.difference > 0 ? '+' : ''}{result.difference} t/ha ({result.percentChange > 0 ? '+' : ''}{result.percentChange}%)</strong></div>
              <div className="result-row"><span>Risk Indicator</span><RiskBadge level={result.riskLevel} /></div>
              <div className="result-row"><span>Based On</span><strong>{result.basedOnRecords} historical records</strong></div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
