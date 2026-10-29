import React, { useState, useMemo } from 'react';
import { useFinancialData } from '../context/FinancialDataContext';
import { useModals } from '../components/layout/MainLayout';
import MetricCard from '../components/common/MetricCard';
import { formatINR } from '../utils/formatters';
import {
  AlertCircle,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  PlusCircle
} from 'lucide-react';

export default function GoalPlanning() {
  const { goals, metrics, applyRecommendedContributions, deleteGoal, updateGoal } = useFinancialData();
  const { openAddGoal, openUpdateProfile } = useModals();

  const [activeFilter, setActiveFilter] = useState('Priority');
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editContribution, setEditContribution] = useState('');

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      if (activeFilter === 'Priority') {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
      }
      if (activeFilter === 'Date') {
        return (a.monthsLeft || 999) - (b.monthsLeft || 999);
      }
      if (activeFilter === 'Progress') {
        const pctA = a.savedAmount / a.targetAmount;
        const pctB = b.savedAmount / b.targetAmount;
        return pctB - pctA;
      }
      return 0;
    });
  }, [goals, activeFilter]);

  const maxBudgetBarValue = Math.max(
    metrics.monthlySurplus,
    metrics.sipBudget,
    metrics.totalMonthlyContributions,
    105248
  );

  const getBarWidthPct = (val) => {
    return Math.min(100, Math.round((val / maxBudgetBarValue) * 100));
  };

  const handleQuickAddSavings = (g) => {
    const additional = 20000;
    updateGoal(g.id, {
      savedAmount: g.savedAmount + additional
    });
  };

  const handleSaveContribution = (id) => {
    const num = Number(editContribution);
    if (!isNaN(num) && num >= 0) {
      updateGoal(id, { monthlyContribution: num });
    }
    setEditingGoalId(null);
  };

  return (
    <div className="goals-page d-flex flex-column gap-3.5">
      {/* Alert Warning if contributions exceed surplus */}
      {metrics.isOverSurplus && (
        <div className="fintech-alert-danger d-flex align-items-center justify-content-between p-3 rounded-3">
          <div className="d-flex align-items-start gap-2.5">
            <AlertCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <div className="fw-semibold text-danger small">Planned contributions exceed your surplus</div>
              <div className="text-danger-emphasis small">
                The monthly contributions entered on your goals add up to more than income minus expenses.
              </div>
            </div>
          </div>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={openUpdateProfile}
          >
            Review
          </button>
        </div>
      )}

      {/* Top 4 Metric Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Total target"
            badgeText="Your input"
            badgeType="input"
            value={formatINR(metrics.totalGoalTarget)}
            subtext={`${goals.length} goals`}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Saved so far"
            badgeText="Your input"
            badgeType="input"
            value={formatINR(metrics.totalGoalSaved)}
            subtext={`${metrics.totalGoalTarget > 0 ? Math.round((metrics.totalGoalSaved / metrics.totalGoalTarget) * 100) : 0}% of total target`}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Contributions / month"
            badgeText="Your input"
            badgeType="input"
            value={formatINR(metrics.totalMonthlyContributions)}
            subtext={`Needed (0% return): ${formatINR(metrics.totalNeededMonthly)}`}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Monthly surplus"
            badgeText="Calculated"
            badgeType="calc"
            value={formatINR(metrics.monthlySurplus)}
            valueClass="text-success"
            subtext={`SIP budget ${formatINR(metrics.sipBudget)}`}
            onClick={openUpdateProfile}
          />
        </div>
      </div>

      {/* Does the plan fit your budget Section */}
      <div className="card fintech-card">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <h5 className="card-section-title m-0">Does the plan fit your budget?</h5>
            <span className="badge badge-fintech-calc">Calculated</span>
          </div>

          <div className="d-flex flex-column gap-3 mb-4">
            <div>
              <div className="d-flex justify-content-between align-items-center small mb-1">
                <span className="text-secondary">Monthly surplus</span>
                <span className="fw-semibold font-numeric">{formatINR(metrics.monthlySurplus)}</span>
              </div>
              <div className="progress budget-bar-track">
                <div
                  className="progress-bar bg-slate-blue"
                  style={{ width: `${getBarWidthPct(metrics.monthlySurplus)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center small mb-1">
                <span className="text-secondary">Investment budget (SIP)</span>
                <span className="fw-semibold font-numeric">{formatINR(metrics.sipBudget)}</span>
              </div>
              <div className="progress budget-bar-track">
                <div
                  className="progress-bar bg-navy-dark"
                  style={{ width: `${getBarWidthPct(metrics.sipBudget)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center small mb-1">
                <span className="text-secondary">Contributions assigned to goals</span>
                <span className={`fw-semibold font-numeric ${metrics.isOverSurplus ? 'text-danger' : 'text-teal'}`}>
                  {formatINR(metrics.totalMonthlyContributions)}
                </span>
              </div>
              <div className="progress budget-bar-track">
                <div
                  className={`progress-bar ${metrics.isOverSurplus ? 'bg-danger' : 'bg-teal'}`}
                  style={{ width: `${getBarWidthPct(metrics.totalMonthlyContributions)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center small mb-1">
                <span className="text-secondary">Needed to fund all goals on time (assumed return)</span>
                <span className="fw-semibold font-numeric">₹1,05,248</span>
              </div>
              <div className="progress budget-bar-track">
                <div
                  className="progress-bar bg-amber-brown"
                  style={{ width: `${getBarWidthPct(105248)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 border-top gap-2">
            <div className="small text-muted">
              Recommended contributions follow priority, then earliest deadline, capped at {formatINR(Math.min(metrics.sipBudget, metrics.monthlySurplus))} (the lower of your SIP budget and surplus).
            </div>
            <button
              className="btn btn-outline-fintech btn-sm d-flex align-items-center gap-1.5 flex-shrink-0"
              onClick={applyRecommendedContributions}
            >
              <Sparkles size={16} className="text-primary" />
              <span>Apply recommended contributions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Your Goals Section Header & Toolbar */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mt-2">
        <h5 className="page-heading-title m-0">Your goals</h5>

        <div className="d-flex align-items-center gap-2">
          <div className="time-filter-pill-group">
            {['Priority', 'Date', 'Progress'].map((f) => (
              <button
                key={f}
                className={`time-filter-pill ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            className="btn btn-dark-fintech btn-sm d-flex align-items-center gap-1.5"
            onClick={openAddGoal}
          >
            <Plus size={16} />
            <span>New goal</span>
          </button>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="row g-3">
        {sortedGoals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
          const isOnTrack = goal.status === 'On track';

          return (
            <div key={goal.id} className="col-12 col-lg-6">
              <div className="card fintech-card h-100">
                <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <h6 className="fw-semibold text-dark mb-0">{goal.name}</h6>
                        <span className="text-muted small">{goal.category}</span>
                      </div>
                      <div className="d-flex align-items-center gap-1.5">
                        <span className={`badge-risk ${goal.priority === 'High' ? 'badge-risk-high' : goal.priority === 'Medium' ? 'badge-risk-moderate' : 'badge-risk-low'}`}>
                          {goal.priority}
                        </span>
                        <span className={`badge-status ${isOnTrack ? 'badge-status-ontrack' : 'badge-status-behind'}`}>
                          {goal.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center small mb-1.5">
                        <span className="fw-medium font-numeric text-dark">
                          {formatINR(goal.savedAmount)} of {formatINR(goal.targetAmount)}
                        </span>
                        <span className="text-muted font-numeric fw-medium">{pct}%</span>
                      </div>
                      <div className="progress" style={{ height: '7px', borderRadius: '4px' }}>
                        <div
                          className={`progress-bar ${isOnTrack ? 'bg-teal' : 'bg-amber'}`}
                          style={{ width: `${pct}%`, borderRadius: '4px' }}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center small py-2 mt-2 border-bottom">
                      <div>
                        <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Remaining</span>
                        <span className="fw-medium font-numeric text-dark">{formatINR(remaining)}</span>
                      </div>
                      <div className="text-end">
                        <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Target date</span>
                        <span className="fw-medium text-dark">{goal.targetDateLabel} · {goal.monthsLeft} mo left</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center small pt-2">
                      <div>
                        <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>You contribute</span>
                        {editingGoalId === goal.id ? (
                          <div className="d-flex align-items-center gap-1 mt-0.5">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: '80px' }}
                              value={editContribution}
                              onChange={(e) => setEditContribution(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveContribution(goal.id);
                                if (e.key === 'Escape') setEditingGoalId(null);
                              }}
                              autoFocus
                            />
                            <button
                              className="btn btn-sm btn-primary-fintech py-0 px-1"
                              onClick={() => handleSaveContribution(goal.id)}
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <span className="fw-semibold font-numeric text-dark">{formatINR(goal.monthlyContribution)}/mo</span>
                        )}
                      </div>
                      <div className="text-end">
                        <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Needed (0% return)</span>
                        <span className="fw-medium font-numeric text-muted">{formatINR(goal.neededZeroReturn)}/mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end align-items-center gap-1 pt-2.5 mt-2 border-top">
                    <button
                      className="btn btn-action-icon"
                      title="Add savings (+ ₹20,000)"
                      onClick={() => handleQuickAddSavings(goal)}
                    >
                      <PlusCircle size={15} />
                    </button>
                    <button
                      className="btn btn-action-icon"
                      title="Edit monthly contribution"
                      onClick={() => {
                        setEditingGoalId(goal.id);
                        setEditContribution(String(goal.monthlyContribution));
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn btn-action-icon text-danger"
                      title="Delete goal"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
