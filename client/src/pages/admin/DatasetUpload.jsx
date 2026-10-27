import { useState, useRef } from 'react';
import { uploadDataset, importDataset } from '../../services/agriService';
import { getErrorMessage } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import Alert from '../../components/Alert.jsx';
import StatCard from '../../components/StatCard.jsx';

export default function DatasetUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    setError('');
    setResult(null);
    setSuccess('');
    const selected = e.target.files[0];
    if (!selected) return;

    const allowed = ['.xlsx', '.xls', '.csv'];
    const ext = '.' + selected.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Invalid file format. Only .xlsx, .xls and .csv files are allowed.');
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadDataset(formData);
      setResult(res);
      setSuccess('Dataset uploaded and validated successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!result?.uploadId) return;
    setImporting(true);
    setError('');
    try {
      const res = await importDataset(result.uploadId);
      setSuccess(`${res.importedCount} valid records imported successfully.`);
      setResult(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setImporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Dataset Upload</h1>
          <p>Excel / CSV → Upload → Backend → Parse → Validate → Preview → Import → MongoDB</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="card mb-3">
        <div className="card-title">📤 Upload File</div>
        <div className="form-group">
          <label className="form-label">Select .xlsx, .xls or .csv file</label>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="form-input" onChange={handleFileSelect} />
        </div>
        <p className="text-muted mb-2" style={{ fontSize: 12.5 }}>
          Required columns: year, state, district, crop, rainfall. Optional: season, temperature, humidity,
          soilType, nitrogen, phosphorus, potassium, ph, area, production, yield.
        </p>
        <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? <span className="spinner"></span> : '⬆️ Upload & Validate'}
        </button>
      </div>

      {result && (
        <>
          <div className="stat-grid">
            <StatCard icon="📄" label="Total Rows" value={result.totalRows} />
            <StatCard icon="✅" label="Valid Rows" value={result.validRows} />
            <StatCard icon="⚠️" label="Invalid Rows" value={result.invalidRows} />
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-title">✅ Valid Rows Preview (first {result.preview.valid.length})</div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Year</th><th>District</th><th>Crop</th><th>Rainfall</th></tr>
                  </thead>
                  <tbody>
                    {result.preview.valid.map((r, i) => (
                      <tr key={i}><td>{r.year}</td><td>{r.district}</td><td>{r.crop}</td><td>{r.rainfall}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-title">⚠️ Invalid Rows Preview (first {result.preview.invalid.length})</div>
              {result.preview.invalid.length ? (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Row</th><th>Reasons</th></tr></thead>
                    <tbody>
                      {result.preview.invalid.map((r, i) => (
                        <tr key={i}><td>{r.row}</td><td>{r.reasons.join(', ')}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted" style={{ fontSize: 13.5 }}>No invalid rows detected. 🎉</p>
              )}
            </div>
          </div>

          <div className="card mt-3">
            <div className="flex-between">
              <div>
                <div className="card-title" style={{ marginBottom: 4 }}>Ready to Import</div>
                <p className="text-muted" style={{ fontSize: 13.5 }}>
                  {result.validRows} valid record(s) will be saved to MongoDB. Invalid rows will be skipped.
                </p>
              </div>
              <button className="btn btn-primary" onClick={handleImport} disabled={importing || !result.validRows}>
                {importing ? <span className="spinner"></span> : '✅ Import Valid Records'}
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
