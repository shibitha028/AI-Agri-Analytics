import { useEffect, useState } from 'react';
import { getDashboard, getFilterOptions, getAgriculturalData } from '../services/agriService';
import { useAuth } from '../context/AuthContext.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Alert from '../components/Alert.jsx';

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  rows.forEach((r) => {
    lines.push(headers.map((h) => JSON.stringify(r[h] ?? '')).join(','));
  });
  return lines.join('\n');
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [records, setRecords] = useState([]);
  const [info, setInfo] = useState('');

  useEffect(() => {
    getDashboard(user?.district).then(setDashboard).catch(() => {});
    getAgriculturalData({ district: user?.district, limit: 100 }).then((r) => setRecords(r.data)).catch(() => {});
  }, [user?.district]);

  const handleExportCSV = () => {
    if (!records.length) {
      setInfo('No records available to export yet.');
      return;
    }
    const csv = toCSV(records);
    downloadFile(csv, `agri-report-${user?.district || 'data'}.csv`, 'text/csv');
  };

  const handleExportPDF = () => {
    const win = window.open('', '_blank');
    const rowsHtml = records.slice(0, 50).map((r) =>
      `<tr><td>${r.year}</td><td>${r.district}</td><td>${r.crop}</td><td>${r.rainfall}</td><td>${r.yield ?? '—'}</td></tr>`
    ).join('');

    win.document.write(`
      <html><head><title>AgriAI Report</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#1f2a24}
        h1{color:#10592a} table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{border:1px solid #ddd;padding:8px;font-size:13px;text-align:left}
        th{background:#e6f4ea}
        .meta{font-size:13px;color:#555;margin-bottom:6px}
      </style></head><body>
        <h1>AgriAI Analytics Report</h1>
        <div class="meta">User: ${user?.name || ''} | District: ${user?.district || '—'} | Year: ${new Date().getFullYear()}</div>
        <div class="meta">Average Rainfall: ${dashboard?.cards.averageRainfall ?? '—'} mm | Average Historical Yield: ${dashboard?.cards.averageYield ?? '—'} t/ha</div>
        <div class="meta">Smart Agri Insight: ${dashboard?.smartAgriInsight ?? '—'}</div>
        <table>
          <thead><tr><th>Year</th><th>District</th><th>Crop</th><th>Rainfall (mm)</th><th>Historical Yield (t/ha)</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Export your district's agricultural analytics as PDF or CSV.</p>
        </div>
      </div>

      <Alert type="info" message={info} onClose={() => setInfo('')} />

      <div className="grid-2">
        <div className="card">
          <div className="card-title">📄 Report Summary</div>
          <div className="result-panel">
            <div className="result-row"><span>User</span><strong>{user?.name}</strong></div>
            <div className="result-row"><span>District</span><strong>{user?.district}</strong></div>
            <div className="result-row"><span>Average Rainfall</span><strong>{dashboard?.cards.averageRainfall ?? '—'} mm</strong></div>
            <div className="result-row"><span>Average Historical Yield</span><strong>{dashboard?.cards.averageYield ?? '—'} t/ha</strong></div>
            <div className="result-row"><span>Soil Health Score</span><strong>{dashboard?.cards.soilHealthScore ?? '—'}</strong></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">⬇️ Export Options</div>
          <p className="text-muted mb-2" style={{ fontSize: 13.5 }}>
            Reports include user, district, year, crop, rainfall, soil, historical yield, and AI insight summary.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleExportPDF}>📄 Download PDF</button>
            <button className="btn btn-secondary" onClick={handleExportCSV}>📊 Export CSV</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
