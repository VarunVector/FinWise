import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useFinancialData } from '../../context/FinancialDataContext';

export default function AddTransactionModal({ isOpen, onClose }) {
  const { addTransaction } = useFinancialData();
  const [formData, setFormData] = useState({
    type: 'debit',
    category: 'SIP Investment',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = {
    debit: ['SIP Investment', 'Stocks Purchase', 'Shopping', 'Dining', 'EMI Payment', 'Utilities', 'Travel', 'Healthcare', 'Education', 'Other Expense'],
    credit: ['Salary', 'Freelance', 'Dividend', 'Interest', 'Business Income', 'Rental Income', 'Other Income']
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description or note');
      return;
    }

    addTransaction({
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description.trim(),
      date: formData.date
    });

    onClose();
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom">
        <div className="modal-header-custom d-flex justify-content-between align-items-center">
          <h5 className="modal-title-custom m-0">Add Transaction</h5>
          <button className="btn-close-custom" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            {/* Type selector */}
            <div className="mb-3">
              <label className="form-label-custom">Transaction Type</label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn-toggle-type flex-fill ${formData.type === 'debit' ? 'active debit' : ''}`}
                  onClick={() => {
                    setFormData({ ...formData, type: 'debit', category: 'SIP Investment' });
                  }}
                >
                  <ArrowDownRight size={16} className="me-1" />
                  Expense / Debit
                </button>
                <button
                  type="button"
                  className={`btn-toggle-type flex-fill ${formData.type === 'credit' ? 'active credit' : ''}`}
                  onClick={() => {
                    setFormData({ ...formData, type: 'credit', category: 'Salary' });
                  }}
                >
                  <ArrowUpRight size={16} className="me-1" />
                  Income / Credit
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-3">
              <label className="form-label-custom">Amount (₹)</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">₹</span>
                <input
                  type="number"
                  className="form-control border-start-0"
                  placeholder="e.g. 25000"
                  value={formData.amount}
                  onChange={(e) => {
                    setError('');
                    setFormData({ ...formData, amount: e.target.value });
                  }}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-3">
              <label className="form-label-custom">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories[formData.type].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label-custom">Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Monthly SIP or Salary Credit"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* Date */}
            <div className="mb-3">
              <label className="form-label-custom">Transaction Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer-custom d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary-fintech btn-sm">
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

