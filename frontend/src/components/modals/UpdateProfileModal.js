import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';

export default function UpdateProfileModal({ isOpen, onClose }) {
  const { financialProfile, updateFinancialProfile } = useFinancialData();
  const [income, setIncome] = useState(financialProfile.monthlyIncome || 95000);
  const [expenses, setExpenses] = useState(financialProfile.monthlyExpenses || 52000);
  const [sipBudget, setSipBudget] = useState(financialProfile.sipBudget || 25000);

  if (!isOpen) return null;

  const currentSurplus = Math.max(0, Number(income) - Number(expenses));
  const currentSavingsRate = Number(income) > 0 ? Math.round((currentSurplus / Number(income)) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFinancialProfile({
      monthlyIncome: Number(income),
      monthlyExpenses: Number(expenses),
      sipBudget: Number(sipBudget),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom">
        <div className="modal-header-custom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <UserCheck size={18} className="text-primary" />
            <h5 className="modal-title-custom m-0">Update Financial Metrics</h5>
          </div>
          <button className="btn-close-custom" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            <p className="text-muted small mb-3">
              Modifying your income or expenses recalculates your monthly surplus, savings rate, and goal feasibility across all FinWise modules.
            </p>

            <div className="mb-3">
              <label className="form-label-custom">Monthly Take-Home Income (₹)</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">₹</span>
                <input
                  type="number"
                  className="form-control border-start-0"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label-custom">Monthly Expenses (₹)</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">₹</span>
                <input
                  type="number"
                  className="form-control border-start-0"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label-custom">Monthly SIP Investment Budget (₹)</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">₹</span>
                <input
                  type="number"
                  className="form-control border-start-0"
                  value={sipBudget}
                  onChange={(e) => setSipBudget(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Live preview */}
            <div className="p-3 rounded-3 bg-light border mt-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="small text-muted">Resulting Monthly Surplus:</span>
                <span className="fw-semibold text-dark">₹{currentSurplus.toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="small text-muted">Savings Rate:</span>
                <span className="fw-semibold text-success">{currentSavingsRate}%</span>
              </div>
              {Number(sipBudget) > currentSurplus && (
                <div className="small text-danger mt-2">
                  ⚠️ Note: Your SIP budget exceeds your calculated monthly surplus.
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer-custom d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-fintech btn-sm">
              Save & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
