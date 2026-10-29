import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';

export default function AddHoldingModal({ isOpen, onClose, defaultCategory = 'Mutual Funds' }) {
  const { addHolding } = useFinancialData();
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    category: defaultCategory,
    assetClass: defaultCategory === 'Fixed Deposits' ? 'Debt' : defaultCategory === 'Gold' ? 'Gold' : 'Equity',
    risk: 'Moderate',
    invested: '',
    value: '',
    units: '',
    rate: '',
    maturityDate: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCategoryChange = (cat) => {
    let ac = 'Equity';
    let sub = '';
    if (cat === 'Mutual Funds') {
      ac = 'Equity';
      sub = 'Flexi Cap · Active';
    } else if (cat === 'Stocks') {
      ac = 'Equity';
      sub = 'NSE Listed · Equity';
    } else if (cat === 'ETFs') {
      ac = 'Equity';
      sub = 'Index ETF · Units';
    } else if (cat === 'Gold') {
      ac = 'Gold';
      sub = 'Sovereign Gold Bond';
    } else if (cat === 'Fixed Deposits') {
      ac = 'Debt';
      sub = 'Bank FD · 7.0% p.a.';
    }

    setFormData((prev) => ({
      ...prev,
      category: cat,
      assetClass: ac,
      subtitle: sub,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter the holding or security name');
      return;
    }
    const inv = Number(formData.invested);
    const val = Number(formData.value || formData.invested);

    if (isNaN(inv) || inv <= 0) {
      setError('Please enter a valid invested amount');
      return;
    }

    addHolding({
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim() || `${formData.category} · Holding`,
      category: formData.category,
      assetClass: formData.assetClass,
      risk: formData.risk,
      invested: inv,
      value: isNaN(val) ? inv : val,
      units: Number(formData.units) || undefined,
      rate: Number(formData.rate) || undefined,
      maturityDate: formData.maturityDate || undefined,
      isAccrual: formData.category === 'Fixed Deposits',
      valuedDate: formData.category === 'Fixed Deposits' ? 'Accrual estimate' : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    });

    onClose();
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom">
        <div className="modal-header-custom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <PlusCircle size={18} className="text-primary" />
            <h5 className="modal-title-custom m-0">Add Investment Holding</h5>
          </div>
          <button className="btn-close-custom" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label-custom">Asset Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="Stocks">Stocks</option>
                  <option value="ETFs">ETFs</option>
                  <option value="Gold">Gold</option>
                  <option value="Fixed Deposits">Fixed Deposits</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label-custom">Asset Class</label>
                <select
                  className="form-select"
                  value={formData.assetClass}
                  onChange={(e) => setFormData({ ...formData, assetClass: e.target.value })}
                >
                  <option value="Equity">Equity</option>
                  <option value="Debt">Debt</option>
                  <option value="Gold">Gold</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label-custom">Holding / Scheme Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Parag Parikh Flexi Cap Fund or Reliance Industries"
                value={formData.name}
                onChange={(e) => {
                  setError('');
                  setFormData({ ...formData, name: e.target.value });
                }}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label-custom">Subtitle / Notes</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Large & Mid Cap · 50 units"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label-custom">Invested Principal (₹)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">₹</span>
                  <input
                    type="number"
                    className="form-control border-start-0"
                    placeholder="e.g. 100000"
                    value={formData.invested}
                    onChange={(e) => setFormData({ ...formData, invested: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label-custom">Current Valuation (₹)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">₹</span>
                  <input
                    type="number"
                    className="form-control border-start-0"
                    placeholder="e.g. 115000"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label-custom">Risk Level</label>
                <select
                  className="form-select"
                  value={formData.risk}
                  onChange={(e) => setFormData({ ...formData, risk: e.target.value })}
                >
                  <option value="Very Low">Very Low</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                </select>
              </div>

              {formData.category === 'Fixed Deposits' ? (
                <div className="col-md-6">
                  <label className="form-label-custom">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 7.1"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  />
                </div>
              ) : (
                <div className="col-md-6">
                  <label className="form-label-custom">Units / Quantity (optional)</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="e.g. 50"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer-custom d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-fintech btn-sm">
              Save Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

