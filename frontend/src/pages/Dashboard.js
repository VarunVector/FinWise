import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { useModals } from '../components/layout/MainLayout';
import MetricCard from '../components/common/MetricCard';
import NoticeBanner from '../components/common/NoticeBanner';
import { formatINR, formatReturnINR, formatPercent } from '../utils/formatters';
import {
  Plus,
  Target,
  UserCheck,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { metrics, goals } = useFinancialData();
  const { openAddTransaction, openAddGoal, openUpdateProfile } = useModals();

  const [timeRange, setTimeRange] = useState('1Y');

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Demo';

  // Formatted date string matching screenshot (e.g. Wednesday, 28 October 2026)
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Performance chart data modelled over time
  const performanceData = [
    { date: '06 Nov', value: 1320000, invested: 1250000 },
    { date: '22 Dec', value: 1475000, invested: 1350000 },
    { date: '05 Feb', value: 1530000, invested: 1420000 },
    { date: '23 Mar', value: 1610000, invested: 1500000 },
    { date: '08 May', value: 1695000, invested: 1580000 },
    { date: '22 Jun', value: 1740000, invested: 1625000 },
    { date: '29 Jul', value: 1795000, invested: 1660000 },
    { date: '12 Sep', value: 1845000, invested: 1685000 },
    { date: '01 Oct', value: 1882122, invested: 1705000 },
    { date: '28 Oct', value: metrics.portfolioValue, invested: metrics.investedPrincipal },
  ];

  // Colors for Asset Allocation Donut
  const ALLOCATION_COLORS = {
    'Mutual Funds': '#00a884',
    'Stocks': '#1e3a8a',
    'ETFs': '#475569',
    'Gold': '#d97706',
    'Fixed Deposits': '#64748b',
  };

  const donutData = metrics.categoryBreakdown.map((cat) => ({
    name: cat.name,
    value: cat.value,
    percentage: cat.percentage,
    color: ALLOCATION_COLORS[cat.name] || '#94a3b8'
  }));

  return (
    <div className="dashboard-page d-flex flex-column gap-3.5">
      {/* Top Welcome & Actions Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="page-heading-title mb-1">
            {greeting}, {firstName}
          </h1>
          <div className="page-heading-subtitle text-muted">
            {todayFormatted}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            className="btn btn-dark-fintech btn-sm d-flex align-items-center gap-1.5"
            onClick={openAddTransaction}
          >
            <Plus size={16} />
            <span>Add transaction</span>
          </button>
          <button
            className="btn btn-outline-fintech btn-sm d-flex align-items-center gap-1.5"
            onClick={openAddGoal}
          >
            <Target size={16} />
            <span>New goal</span>
          </button>
          <button
            className="btn btn-outline-fintech btn-sm d-flex align-items-center gap-1.5"
            onClick={openUpdateProfile}
          >
            <UserCheck size={16} />
            <span>Update profile</span>
          </button>
          <button
            className="btn btn-outline-fintech btn-sm d-flex align-items-center gap-1.5"
            onClick={() => navigate('/portfolio')}
          >
            <Clock size={16} />
            <span>Investments</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <NoticeBanner message="Demo data. Holdings, valuations and transactions are sample data stored in your browser. Values change only when you edit them; nothing is a live market price. Portfolio value uses the latest valuation recorded on each holding; fixed deposits are accrual estimates." />

      {/* 4 Metric Cards */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Portfolio value"
            badgeText="Demo data"
            badgeType="demo"
            value={formatINR(metrics.portfolioValue)}
            subtext={`${metrics.holdingsCount} holdings`}
            onClick={() => navigate('/portfolio')}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Invested principal"
            badgeText="Your input"
            badgeType="input"
            value={formatINR(metrics.investedPrincipal)}
            subtext="Sum of holding cost basis"
            onClick={() => navigate('/portfolio')}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Absolute return"
            badgeText="Calculated"
            badgeType="calc"
            value={formatReturnINR(metrics.absoluteReturn)}
            valueClass="text-success"
            subtext={`↑ ${formatPercent(metrics.returnPercentage, false)} on invested`}
            onClick={() => navigate('/portfolio')}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Monthly surplus"
            badgeText="Calculated"
            badgeType="calc"
            value={formatINR(metrics.monthlySurplus)}
            valueClass="text-success"
            subtext={`${metrics.savingsRate.toFixed(1)}% savings rate`}
            onClick={openUpdateProfile}
          />
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="row g-3">
        {/* Left: Portfolio Performance Chart */}
        <div className="col-12 col-xl-8">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="card-section-title m-0">Portfolio performance</h5>
                    <span className="badge badge-fintech-estimate">Modelled estimate</span>
                  </div>
                  <div className="card-section-subtitle text-muted mt-1 small">
                    Modelled from purchase dates and last valuations; not recorded market prices. Change over range: <strong className="text-success">₹5,37,401</strong> (includes new money invested)
                  </div>
                </div>

                {/* Range Selector */}
                <div className="time-filter-pill-group">
                  {['1M', '3M', '6M', '1Y', 'All'].map((t) => (
                    <button
                      key={t}
                      className={`time-filter-pill ${timeRange === t ? 'active' : ''}`}
                      onClick={() => setTimeRange(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart container */}
              <div className="performance-chart-wrapper flex-grow-1" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00a884" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00a884" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      domain={[1100000, 2100000]}
                      ticks={[1200000, 1400000, 1600000, 1800000, 2000000]}
                      tickFormatter={(v) => `₹${v / 100000}L`}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="fintech-chart-tooltip shadow-sm">
                              <div className="tooltip-date">{data.date} 2026</div>
                              <div className="tooltip-row">
                                <span className="tooltip-label">Value (modelled):</span>
                                <span className="tooltip-val">{formatINR(data.value)}</span>
                              </div>
                              <div className="tooltip-row">
                                <span className="tooltip-label">Invested:</span>
                                <span className="tooltip-val text-muted">{formatINR(data.invested)}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="invested"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Area
                      type="stepAfter"
                      dataKey="value"
                      stroke="#00a884"
                      strokeWidth={2.2}
                      fillOpacity={1}
                      fill="url(#valueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Asset Allocation Donut */}
        <div className="col-12 col-xl-4">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-section-title m-0">Asset allocation</h5>
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 text-teal fw-medium"
                  onClick={() => navigate('/portfolio')}
                >
                  Details
                </button>
              </div>

              {/* Donut Chart */}
              <div className="d-flex align-items-center justify-content-center my-2" style={{ height: '160px' }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [formatINR(value), name]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="allocation-legend-list d-flex flex-column gap-1.5 mt-2">
                {donutData.map((item) => (
                  <div key={item.name} className="d-flex align-items-center justify-content-between small py-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className="legend-dot" style={{ backgroundColor: item.color }} />
                      <span className="text-secondary">{item.name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className="fw-medium text-dark">{item.percentage.toFixed(1)}%</span>
                      <span className="text-muted text-end" style={{ minWidth: '75px' }}>
                        {formatINR(item.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Line */}
              <div className="d-flex justify-content-between align-items-center pt-2.5 mt-2 border-top">
                <span className="text-muted small">Total</span>
                <span className="fw-bold text-dark">{formatINR(metrics.portfolioValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Goal Fit & Quick Intelligence */}
      <div className="row g-3">
        {/* Goal Fit Status Banner */}
        <div className="col-12 col-lg-7">
          <div className="card fintech-card">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <Target size={18} className="text-teal" />
                  <h6 className="card-section-title m-0">Goal Planning Highlights</h6>
                </div>
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 text-teal fw-medium"
                  onClick={() => navigate('/goals')}
                >
                  View all ({goals.length})
                </button>
              </div>

              <div className="d-flex flex-column gap-3">
                {goals.slice(0, 2).map((goal) => {
                  const pct = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
                  return (
                    <div key={goal.id} className="p-3 rounded-3 bg-light border">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold text-dark">{goal.name}</span>
                        <span className={`badge ${goal.status === 'On track' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                          {goal.status}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center small text-muted mb-2">
                        <span>{formatINR(goal.savedAmount)} of {formatINR(goal.targetAmount)}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div
                          className={`progress-bar ${goal.status === 'On track' ? 'bg-success' : 'bg-warning'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* AI Financial Advisor Quick Widget */}
        <div className="col-12 col-lg-5">
          <div className="card fintech-card">
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-teal" />
                  <h6 className="card-section-title m-0">FinWise AI Copilot</h6>
                </div>
                <p className="small text-muted mb-3">
                  Your monthly savings surplus of {formatINR(metrics.monthlySurplus)} gives you healthy buffer. Recommended allocation: 60% SIP into Index & Flexi Cap funds, 25% Emergency reserve, 15% Sovereign Gold Bonds.
                </p>
              </div>
              <button
                className="btn btn-outline-fintech btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate('/ai-advisor')}
              >
                <span>Ask AI Advisor</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
