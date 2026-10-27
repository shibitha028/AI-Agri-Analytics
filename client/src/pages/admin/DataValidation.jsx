import { useEffect, useState } from 'react';
import { getUploadHistory } from '../../services/agriService';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const RULES = [
  { rule: 'Missing District', description: 'Row rejected if the district field is empty.' },
  { rule: 'Missing Crop', description: 'Row rejected if the crop field is empty.' },
  { rule: 'Invalid Year', description: 'Year must be a number between 1900 and 2100.' },
  { rule: 'Invalid Rainfall', description: 'Rainfall value must be numeric.' },
  { rule: 'Duplicate Records', description: 'Rows with the same year, district, crop and season are flagged as duplicates.' },
  { rule: 'Invalid Numeric Values', description: 'Numeric fields (temperature, humidity, NPK, pH, area, production, yield) must contain valid numbers.' }
];

export default function DataValidation() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUploadHistory().then((res) => setUploads(res.data)).finally(() => setLoading(false));
  }, []);

  const recentIssues = uploads
    .filter((u) => u.validationErrors && u.validationErrors.length)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Data Validation</h1>
          <p>Validation rules applied to every uploaded Excel/CSV dataset before import.</p>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-title">📋 Validation Rules</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Rule</th><th>Description</th></tr></thead>
            <tbody>
              {RULES.map((r) => (
                <tr key={r.rule}><td><strong>{r.rule}</strong></td><td>{r.description}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-title">⚠️ Recent Validation Issues</div>
        {loading ? (
          <Loader />
        ) : !recentIssues.length ? (
          <EmptyState icon="✅" title="No recent validation issues" description="Uploaded datasets have been clean so far." />
        ) : (
          recentIssues.map((u) => (
            <div key={u._id} className="mb-2">
              <div style={{ fontWeight: 700, fontSize: 14 }}>{u.fileName}</div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Row</th><th>Reason</th></tr></thead>
                  <tbody>
                    {u.validationErrors.slice(0, 10).map((e, i) => (
                      <tr key={i}><td>{e.row}</td><td>{e.reason}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
