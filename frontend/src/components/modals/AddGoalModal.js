import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';

export default function AddGoalModal({ isOpen, onClose }) {
  const { addGoal } = useFinancialData();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Wealth Building',
    targetAmount: '',
    savedAmount: '0',
    monthlyContribution: '',
    targetDate: '2028-12-31',
    priority: 'High'
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const goalCategories = [
    'Emergency Fund',
    'Higher Education',
    'Home Purchase',
    'Retirement',
    'Vehicle',
    'Travel & Lifestyle',
    'Wealth Building',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter a goal name');
      return;
    }
    const target = Number(formData.targetAmount);
    if (!target || target <= 0) {
      setError('Please enter a valid target amount');
      return;
    }

    const saved = Number(formData.savedAmount) || 0;
    const contribution = Number(formData.monthlyContribution) || 0;

    // Calculate months left
    const targetD = new Date(formData.targetDate);
    const now = new Date();
    const monthsDiff = Math.max(1, (targetD.getFullYear() - now.getFullYear()) * 12 + (targetD.getMonth() - now.getMonth()));

    addGoal({
      name: formData.name.trim(),
      category: formData.category,
      targetAmount: target,
      savedAmount: saved,
      monthlyContribution: contribution,
      targetDate: formData.targetDate,
      targetDateLabel: targetD.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      monthsLeft: monthsDiff,
      priority: formData.priority,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom">
        <div className="modal-header-custom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <Target size={18} className="text-primary" />
            <h5 className="modal-title-custom m-0">Create Financial Goal</h5>
          </div>
          <button className="btn-close-custom" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <div className="mb-3">
              <label className="form-label-custom">Goal Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Higher Education or Down Payment"
                value={formData.name}
                onChange={(e) => {
                  setError('');
                  setFormData({ ...formData, name: e.target.value });
                }}
                required
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label-custom">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {goalCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label-custom">Target Amount (₹)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">₹</span>
                  <input
                    type="number"
                    className="form-control border-start-0"
                    placeholder="e.g. 2500000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Saved So Far (₹)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">₹</span>
                  <input
                    type="number"
                    className="form-control border-start-0"
                    placeholder="0"
                    value={formData.savedAmount}
                    onChange={(e) => setFormData({ ...formData, savedAmount: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label-custom">Monthly Contribution (₹)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">₹</span>
                  <input
                    type="number"
                    className="form-control border-start-0"
                    placeholder="e.g. 15000"
                    value={formData.monthlyContribution}
                    onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Target Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer-custom d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-fintech btn-sm">
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

