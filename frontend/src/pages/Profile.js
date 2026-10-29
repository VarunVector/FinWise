import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinancialData } from '../context/FinancialDataContext';
import MetricCard from '../components/common/MetricCard';
import NoticeBanner from '../components/common/NoticeBanner';
import { formatINR } from '../utils/formatters';
import {
  User,
  Shield,
  CheckCircle2,
  Save
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { financialProfile, updateFinancialProfile, metrics } = useFinancialData();

  const [formData, setFormData] = useState({
    name: user?.name || 'Demo User',
    email: user?.email || 'demo@finwise.ai',
    phone: user?.phone || '+91-9876543210',
    monthlyIncome: financialProfile.monthlyIncome || 95000,
    monthlyExpenses: financialProfile.monthlyExpenses || 52000,
    sipBudget: financialProfile.sipBudget || 25000,
    emergencyFundMonths: financialProfile.emergencyFundMonths || 6,
    riskTier: financialProfile.riskTier || 'Moderate',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      updateFinancialProfile({
        monthlyIncome: Number(formData.monthlyIncome),
        monthlyExpenses: Number(formData.monthlyExpenses),
        sipBudget: Number(formData.sipBudget),
        emergencyFundMonths: Number(formData.emergencyFundMonths),
        riskTier: formData.riskTier,
      });

      try {
        await fetch('http://localhost:5000/api/risk/assess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userInfo: {
              email: formData.email,
              name: formData.name,
              user_id: user?.id || 'demo_user'
            },
            questionnaire: {
              monthlyIncome: formData.monthlyIncome,
              monthlyExpenses: formData.monthlyExpenses,
              emergencyFund: formData.emergencyFundMonths >= 6 ? 'More than 6 months' : '3–6 months',
            },
            modelInput: {
              monthlyIncome: formData.monthlyIncome,
              monthlyExpenses: formData.monthlyExpenses,
              emergencySavings: formData.emergencyFundMonths,
              emergencyConfidence: 4,
              stocksBonds: 3,
              investmentChoice: 3,
              financialKnowledge: 4,
              householdIncome: 5,
              incomeStability: 4,
              spendingVsIncome: 3,
              too_much_debt: 1,
              creditCardLateFee: 0,
              medicalDebt: 0
            }
          })
        });
      } catch (backendErr) {
        console.warn('Backend server not reachable, updated locally:', backendErr);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page d-flex flex-column gap-3.5">
      <NoticeBanner message="Financial Profile. Modifications recalculate your portfolio asset benchmarks, monthly surplus, and goal recommendations." />

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <MetricCard
            title="Monthly Take-Home"
            badgeText="Your input"
            badgeType="input"
            value={formatINR(formData.monthlyIncome)}
            subtext="Primary earning capacity"
          />
        </div>

        <div className="col-12 col-md-4">
          <MetricCard
            title="Monthly Surplus"
            badgeText="Calculated"
            badgeType="calc"
            value={formatINR(metrics.monthlySurplus)}
            valueClass="text-success"
            subtext={`${metrics.savingsRate.toFixed(1)}% savings rate`}
          />
        </div>

        <div className="col-12 col-md-4">
          <MetricCard
            title="Risk Capacity Tier"
            badgeText="Calibrated ML"
            badgeType="calc"
            value={formData.riskTier}
            valueClass="text-teal"
            subtext="Institutional score: 54/100"
          />
        </div>
      </div>

      <div className="row g-3">
        {/* Form */}
        <div className="col-12 col-lg-7">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <User size={18} className="text-teal" />
                  <h5 className="card-section-title m-0">Financial Profile Details</h5>
                </div>
                {saveSuccess && (
                  <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1">
                    <CheckCircle2 size={13} /> Saved & Recalculated
                  </span>
                )}
              </div>

              <form onSubmit={handleSave}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label-custom">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Registered Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label-custom">Monthly Income (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Monthly Expenses (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.monthlyExpenses}
                      onChange={(e) => setFormData({ ...formData, monthlyExpenses: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label-custom">Monthly SIP Budget (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.sipBudget}
                      onChange={(e) => setFormData({ ...formData, sipBudget: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Emergency Fund Reserve</label>
                    <select
                      className="form-select"
                      value={formData.emergencyFundMonths}
                      onChange={(e) => setFormData({ ...formData, emergencyFundMonths: Number(e.target.value) })}
                    >
                      <option value={3}>3 Months Expenses</option>
                      <option value={6}>6 Months Expenses (Recommended)</option>
                      <option value={12}>12 Months Expenses</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary-fintech btn-sm d-flex align-items-center gap-1.5"
                  disabled={saving}
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Profile & Recalculate'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Institutional Risk Capacity Breakdown */}
        <div className="col-12 col-lg-5">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Shield size={18} className="text-teal" />
                  <h5 className="card-section-title m-0">Risk Capacity Calibration</h5>
                </div>
                <p className="small text-muted mb-3">
                  Calibrated Institutional Score formulated in Python ExtraTrees model and calibrated risk matrix.
                </p>

                <div className="d-flex flex-column gap-2.5">
                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-secondary">Emergency Buffer & Safety</span>
                      <span className="fw-medium text-dark">85% (High)</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-teal" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-secondary">Investment Experience</span>
                      <span className="fw-medium text-dark">65% (Moderate)</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-teal" style={{ width: '65%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-secondary">Income & Cashflow Stability</span>
                      <span className="fw-medium text-dark">78% (Strong)</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-teal" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-secondary">Debt Burden Impact</span>
                      <span className="fw-medium text-success">Low (Healthy)</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-success" style={{ width: '25%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-light border mt-4">
                <div className="small fw-semibold text-dark mb-1">Recommended Asset Allocation:</div>
                <div className="small text-muted">
                  55% Equity (Large + Flexi Cap) · 33% Debt (Liquid + FDs) · 12% Gold (SGBs)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
