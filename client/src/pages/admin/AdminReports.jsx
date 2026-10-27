import { useEffect, useState } from 'react';
import { getAdminDashboard, getAgriculturalData } from '../../services/agriService';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import Alert from '../../components/Alert.jsx';

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  rows.forEach((r) => lines.push(headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')));
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

export default function AdminReports() {
  const [cards, setCards] = useState(null);
  const [info, setInfo] = useState('');

  useEffect(() => {
    getAdminDashboard().then((res) => setCards(res.cards)).catch(() => {});
  }, []);

  const handleExportCSV = async () => {
    const res = await getAgriculturalData({ limit: 1000 });
    if (!res.data.length) {
      setInfo('No records available to export yet.');
      return;
    }
    downloadFile(toCSV(res.data), 'agri-platform-report.csv', 'text/csv');
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Export platform-wide agricultural data.</p>
        </div>
      </div>

      <Alert type="info" message={info} onClose={() => setInfo('')} />

      <div className="grid-2">
        <div className="card">
          <div className="card-title">📊 Platform Summary</div>
          {cards && (
            <div className="result-panel">
              <div className="result-row"><span>Total Users</span><strong>{cards.totalUsers}</strong></div>
              <div className="result-row"><span>Total Records</span><strong>{cards.totalRecords}</strong></div>
              <div className="result-row"><span>Total Districts</span><strong>{cards.totalDistricts}</strong></div>
              <div className="result-row"><span>Total Crops</span><strong>{cards.totalCrops}</strong></div>
              <div className="result-row"><span>Total Datasets</span><strong>{cards.totalDatasets}</strong></div>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title">⬇️ Export</div>
          <button className="btn btn-primary btn-block" onClick={handleExportCSV}>📊 Export All Records (CSV)</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
