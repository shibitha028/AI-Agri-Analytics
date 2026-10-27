import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { getFilterOptions, getAgriculturalData } from '../services/agriService';
import { getErrorMessage } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import FiltersBar from '../components/FiltersBar.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';

const TABS = ['Rainfall', 'Crop Yield', 'Production', 'Temperature', 'Humidity', 'Soil'];
const COLORS = ['#1a7d3a', '#3fb463', '#f2a71b', '#5a8fd6', '#d64545', '#8a5a00'];

const METRIC_KEY = {
  Rainfall: 'rainfall',
  'Crop Yield': 'yield',
  Production: 'production',
  Temperature: 'temperature',
  Humidity: 'humidity',
  Soil: 'ph'
};

export default function HistoricalAnalytics() {
  const [tab, setTab] = useState('Rainfall');
  const [filters, setFilters] = useState({});
  const [options, setOptions] = useState({});
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAgriculturalData({ ...filters, limit: 200 })
      .then((res) => mounted && setRecords(res.data))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [filters]);

  const key = METRIC_KEY[tab];

  // Line/Bar: aggregate by year
  const byYear = {};
  records.forEach((r) => {
    if (r[key] === undefined) return;
    byYear[r.year] = byYear[r.year] || [];
    byYear[r.year].push(r[key]);
  });
  const yearSeries = Object.keys(byYear).sort().map((y) => ({
    year: y,
    value: +(byYear[y].reduce((a, b) => a + b, 0) / byYear[y].length).toFixed(2)
  }));

  // Donut: distribution by district
  const byDistrict = {};
  records.forEach((r) => {
    if (r[key] === undefined) return;
    byDistrict[r.district] = (byDistrict[r.district] || 0) + r[key];
  });
  const districtPie = Object.keys(byDistrict).map((d) => ({ name: d, value: +byDistrict[d].toFixed(1) }));

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Historical Analytics</h1>
          <p>Explore rainfall, yield, production, temperature, humidity and soil trends from MongoDB records.</p>
        </div>
      </div>

      <FiltersBar filters={filters} onChange={setFilters} options={options} fields={['district', 'year', 'crop', 'season']} />

      <div className="tabs-row">
        {TABS.map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader />
      ) : !records.length ? (
        <EmptyState title="No historical records match these filters" description="Try adjusting or clearing the filters above." />
      ) : (
        <div className="grid-2">
          <div className="card">
            <div className="card-title">📈 {tab} — Year-wise Trend (Line Chart)</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={yearSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef3ee" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1a7d3a" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-title">📊 {tab} — Year-wise Comparison (Bar Chart)</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef3ee" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#3fb463" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-title">🟢 {tab} — Cumulative Area Trend (Area Chart)</div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={yearSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef3ee" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#1a7d3a" fill="#cdeed9" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-title">🍩 {tab} — Distribution by District (Donut Chart)</div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={districtPie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                  {districtPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
