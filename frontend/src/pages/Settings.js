import React, { useState, useEffect } from 'react';
import { useFinancialData } from '../context/FinancialDataContext';
import NoticeBanner from '../components/common/NoticeBanner';
import {
  Settings as SettingsIcon,
  Activity,
  Database,
  RotateCcw,
  Download,
  CheckCircle2,
  Server
} from 'lucide-react';

export default function Settings() {
  const { resetToDemoData, holdings, goals, financialProfile, transactions } = useFinancialData();

  const [backendStatus, setBackendStatus] = useState({
    checking: false,
    checked: false,
    flaskOnline: false,
    mongoConnected: false,
    message: ''
  });

  const [resetDone, setResetDone] = useState(false);

  const checkBackendHealth = async () => {
    setBackendStatus({ checking: true, checked: false, flaskOnline: false, mongoConnected: false, message: 'Testing backend ping...' });
    try {
      const res = await fetch('http://localhost:5000/api/health', { signal: AbortSignal.timeout(3000) });
      const json = await res.json();
      setBackendStatus({
        checking: false,
        checked: true,
        flaskOnline: json.success || json.status === 'ok',
        mongoConnected: json.mongodb?.connected || false,
        message: json.mongodb?.message || 'Flask backend reachable.'
      });
    } catch (err) {
      setBackendStatus({
        checking: false,
        checked: true,
        flaskOnline: false,
        mongoConnected: false,
        message: 'Could not connect to Flask API on http://localhost:5000. Operating in offline demo fallback mode.'
      });
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const handleReset = () => {
    if (window.confirm('Reset all holdings, goals, and transactions to the default demo data?')) {
      resetToDemoData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  const handleExportData = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      financialProfile,
      holdings,
      goals,
      transactions
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinWise_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="settings-page d-flex flex-column gap-3.5">
      <NoticeBanner message="Settings & Diagnostics. Inspect connected backend health, configure fintech display formats, and manage local demo storage." />

      <div className="card fintech-card">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <Server size={18} className="text-teal" />
              <h5 className="card-section-title m-0">Backend API & Database Diagnostics</h5>
            </div>
            <button
              className="btn btn-outline-fintech btn-sm d-flex align-items-center gap-1.5"
              onClick={checkBackendHealth}
              disabled={backendStatus.checking}
            >
              <Activity size={14} className={backendStatus.checking ? 'animate-spin' : ''} />
              <span>{backendStatus.checking ? 'Pinging...' : 'Re-test Connection'}</span>
            </button>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark small">Flask ML & REST Server</div>
                  <div className="text-muted small">http://localhost:5000</div>
                </div>
                <span className={`badge ${backendStatus.flaskOnline ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                  {backendStatus.flaskOnline ? '● Online & Ready' : '○ Standalone / Offline'}
                </span>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold text-dark small">MongoDB Atlas Questionnaire Store</div>
                  <div className="text-muted small">Cloud Database Cluster</div>
                </div>
                <span className={`badge ${backendStatus.mongoConnected ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                  {backendStatus.mongoConnected ? '● Connected' : '○ Local Fallback'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 small text-muted">
            Status details: <em>{backendStatus.message}</em>
          </div>
        </div>
      </div>

      <div className="card fintech-card">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <SettingsIcon size={18} className="text-teal" />
            <h5 className="card-section-title m-0">Display & Localization</h5>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label-custom">Currency</label>
              <input type="text" className="form-control" value="INR (₹) - Indian Rupee" disabled />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label-custom">Number Scale</label>
              <input type="text" className="form-control" value="Indian (Lakhs & Crores)" disabled />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label-custom">Date Format</label>
              <input type="text" className="form-control" value="DD MMM YYYY (e.g. 28 Oct 2026)" disabled />
            </div>
          </div>
        </div>
      </div>

      <div className="card fintech-card">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Database size={18} className="text-teal" />
            <h5 className="card-section-title m-0">Demo Data Management</h5>
          </div>

          <p className="small text-muted mb-3">
            FinWise stores your simulated holdings, goal progress, and transactions safely in your local browser storage. You can export a snapshot or restore the clean original baseline dataset at any time.
          </p>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <button
              className="btn btn-outline-fintech btn-sm d-flex align-items-center gap-1.5"
              onClick={handleExportData}
            >
              <Download size={16} />
              <span>Export Portfolio JSON</span>
            </button>

            <button
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1.5"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              <span>Reset to Clean Demo State</span>
            </button>

            {resetDone && (
              <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1">
                <CheckCircle2 size={13} /> Demo data successfully reset
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
