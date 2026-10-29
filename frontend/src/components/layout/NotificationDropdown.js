import React from 'react';
import { Bell, AlertTriangle, TrendingUp, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinancialData } from '../../context/FinancialDataContext';

export default function NotificationDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { metrics } = useFinancialData();

  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      type: metrics.isOverSurplus ? 'warning' : 'info',
      icon: <AlertTriangle size={16} className="text-danger" />,
      title: metrics.isOverSurplus ? 'Planned contributions exceed surplus' : 'Surplus budget on track',
      desc: metrics.isOverSurplus
        ? `Goals require ₹${metrics.totalMonthlyContributions.toLocaleString('en-IN')}/mo vs surplus of ₹${metrics.monthlySurplus.toLocaleString('en-IN')}.`
        : `Your surplus is ₹${metrics.monthlySurplus.toLocaleString('en-IN')}/mo with a ${metrics.savingsRate.toFixed(1)}% savings rate.`,
      time: '10m ago',
      link: '/goals'
    },
    {
      id: 2,
      type: 'rebalance',
      icon: <TrendingUp size={16} className="text-primary" />,
      title: 'Portfolio asset class rebalancing',
      desc: 'Equity allocation is 66.4% vs 55% recommended for moderate profile. Consider rebalancing into debt funds.',
      time: '2h ago',
      link: '/portfolio'
    },
    {
      id: 3,
      type: 'fd',
      icon: <ShieldCheck size={16} className="text-success" />,
      title: 'Fixed Deposit Accrual',
      desc: 'Bank FD - 3Y accrued ₹10,070 interest at 7.1% p.a.',
      time: '1d ago',
      link: '/investments/fixed-deposits'
    },
    {
      id: 4,
      type: 'ai',
      icon: <CheckCircle2 size={16} className="text-info" />,
      title: 'LSTM Stock Predictions updated',
      desc: 'NIFTY 50 predictions ready for 10 high-volume stocks with confidence ratings.',
      time: '1d ago',
      link: '/stock-prediction'
    },
    {
      id: 5,
      type: 'demo',
      icon: <CheckCircle2 size={16} className="text-muted" />,
      title: 'Demo mode active',
      desc: 'All data is safely simulated and persisted in local browser storage.',
      time: 'Active',
      link: '/settings'
    }
  ];

  return (
    <div className="notification-dropdown-menu shadow-lg">
      <div className="notification-header d-flex justify-content-between align-items-center p-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <Bell size={16} className="text-primary" />
          <span className="fw-semibold small">Notifications & Alerts</span>
          <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.65rem' }}>{notifications.length}</span>
        </div>
        <button className="btn btn-sm btn-link text-muted p-0" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="notification-list custom-scrollbar" style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className="notification-item p-3 border-bottom d-flex gap-2.5 cursor-pointer hover-bg"
            onClick={() => {
              onClose();
              navigate(n.link);
            }}
          >
            <div className="notification-icon-box flex-shrink-0 mt-0.5">
              {n.icon}
            </div>
            <div className="notification-content flex-grow-1">
              <div className="d-flex justify-content-between align-items-center">
                <span className="notification-title fw-medium text-dark small">{n.title}</span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>{n.time}</span>
              </div>
              <p className="notification-desc text-muted mb-0 small mt-0.5" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                {n.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="notification-footer p-2 text-center bg-light">
        <button
          className="btn btn-link btn-sm text-decoration-none py-1 text-primary fw-medium"
          style={{ fontSize: '0.8rem' }}
          onClick={() => {
            onClose();
            navigate('/settings');
          }}
        >
          Notification Settings & Diagnostics
        </button>
      </div>
    </div>
  );
}

