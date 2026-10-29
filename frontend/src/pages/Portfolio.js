import React, { useState, useMemo } from 'react';
import { useFinancialData } from '../context/FinancialDataContext';
import { useModals } from '../components/layout/MainLayout';
import MetricCard from '../components/common/MetricCard';
import NoticeBanner from '../components/common/NoticeBanner';
import { formatINR, formatReturnINR, formatPercent } from '../utils/formatters';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  PlusCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Line
} from 'recharts';

export default function Portfolio() {
  const { holdings, metrics, deleteHolding, updateHolding } = useFinancialData();
  const { openAddHolding } = useModals();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [riskFilter, setRiskFilter] = useState('All risk levels');
  const [sortBy, setSortBy] = useState('value');
  const [timeRange, setTimeRange] = useState('1Y');

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

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

  const CATEGORY_COLORS = {
    'Mutual Funds': '#00a884',
    'Stocks': '#1e3a8a',
    'ETFs': '#475569',
    'Gold': '#d97706',
    'Fixed Deposits': '#64748b',
  };

  const ASSET_CLASS_COLORS = {
    'Equity': '#00a884',
    'Debt': '#1e3a8a',
    'Gold': '#d97706',
  };

  const categoryDonutData = metrics.categoryBreakdown.map((cat) => ({
    name: cat.name,
    value: cat.value,
    percentage: cat.percentage,
    color: CATEGORY_COLORS[cat.name] || '#94a3b8'
  }));

  const assetClassDonutData = metrics.assetClassBreakdown.map((ac) => ({
    name: ac.name,
    value: ac.value,
    percentage: ac.percentage,
    color: ASSET_CLASS_COLORS[ac.name] || '#94a3b8'
  }));

  const filteredHoldings = useMemo(() => {
    return holdings
      .filter((h) => {
        const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (h.subtitle && h.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = categoryFilter === 'All categories' || h.category === categoryFilter;
        const matchesRisk = riskFilter === 'All risk levels' || h.risk === riskFilter;
        return matchesSearch && matchesCategory && matchesRisk;
      })
      .sort((a, b) => {
        if (sortBy === 'value') return b.value - a.value;
        if (sortBy === 'invested') return b.invested - a.invested;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'return') {
          const retA = a.value - a.invested;
          const retB = b.value - b.invested;
          return retB - retA;
        }
        return 0;
      });
  }, [holdings, searchQuery, categoryFilter, riskFilter, sortBy]);

  const handleQuickInvest = (h) => {
    const additional = 10000;
    updateHolding(h.id, {
      invested: h.invested + additional,
      value: h.value + additional
    });
  };

  const handleSaveEdit = (id) => {
    const num = Number(editValue);
    if (!isNaN(num) && num > 0) {
      updateHolding(id, { value: num });
    }
    setEditingId(null);
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case 'Very Low':
        return 'badge-risk-very-low';
      case 'Low':
        return 'badge-risk-low';
      case 'Moderate':
        return 'badge-risk-moderate';
      case 'High':
        return 'badge-risk-high';
      case 'Very High':
        return 'badge-risk-very-high';
      default:
        return 'badge-risk-moderate';
    }
  };

  return (
    <div className="portfolio-page d-flex flex-column gap-3.5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div>
          <h1 className="page-heading-title mb-1">Portfolio</h1>
          <div className="page-heading-subtitle text-muted">
            The single source of truth for your investments. Every total in the app comes from these holdings.
          </div>
        </div>
        <button
          className="btn btn-dark-fintech btn-sm d-flex align-items-center gap-1.5 align-self-start"
          onClick={() => openAddHolding('Mutual Funds')}
        >
          <Plus size={16} />
          <span>Add holding</span>
        </button>
      </div>

      <NoticeBanner message="Demo data. Valuations are figures stored on each holding (sample or entered by you), not live prices. Fixed deposits show an accrual estimate. Returns are unrealised and not guaranteed." />

      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Current value"
            badgeText="Demo data"
            badgeType="demo"
            value={formatINR(metrics.portfolioValue)}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Total invested"
            badgeText="Your input"
            badgeType="input"
            value={formatINR(metrics.investedPrincipal)}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Absolute gain / loss"
            badgeText="Calculated"
            badgeType="calc"
            value={formatReturnINR(metrics.absoluteReturn)}
            valueClass="text-success"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Return"
            badgeText="Calculated"
            badgeType="calc"
            value={formatPercent(metrics.returnPercentage, true)}
            valueClass="text-success"
            subtext="Gain ÷ invested"
          />
        </div>
      </div>

      <div className="row g-3">
        {/* By Category */}
        <div className="col-12 col-lg-6">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              <h5 className="card-section-title mb-3">By category</h5>

              <div className="d-flex align-items-center justify-content-center my-2" style={{ height: '160px' }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={categoryDonutData}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryDonutData.map((entry, index) => (
                        <Cell key={`cell-cat-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [formatINR(value), name]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="allocation-legend-list d-flex flex-column gap-1.5 mt-2">
                {categoryDonutData.map((item) => (
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

              <div className="d-flex justify-content-between align-items-center pt-2.5 mt-2 border-top">
                <span className="text-muted small">Total</span>
                <span className="fw-bold text-dark">{formatINR(metrics.portfolioValue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* By Asset Class */}
        <div className="col-12 col-lg-6">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              <div>
                <h5 className="card-section-title mb-1">By asset class</h5>
                <div className="text-muted small mb-2">
                  Suggested for your profile (moderate, 12 yrs): 55% equity · 33% debt · 12% gold.
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-center my-2" style={{ height: '160px' }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={assetClassDonutData}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {assetClassDonutData.map((entry, index) => (
                        <Cell key={`cell-ac-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [formatINR(value), name]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="allocation-legend-list d-flex flex-column gap-1.5 mt-2">
                {assetClassDonutData.map((item) => (
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

              <div className="d-flex justify-content-between align-items-center pt-2.5 mt-2 border-top">
                <span className="text-muted small">Total</span>
                <span className="fw-bold text-dark">{formatINR(metrics.portfolioValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card fintech-card">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
            <div>
              <h5 className="card-section-title m-0">Value over time</h5>
              <div className="card-section-subtitle text-muted mt-1 small">
                Modelled from purchase dates and last valuations; not recorded market prices. Change over range: <strong className="text-success">₹5,37,401</strong> (includes new money invested)
              </div>
            </div>

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

          <div className="performance-chart-wrapper" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={performanceData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00a884" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00a884" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  domain={[1100000, 2100000]}
                  ticks={[1200000, 1400000, 1600000, 1800000, 2000000]}
                  tickFormatter={(v) => `₹${v / 100000}L`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Value']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="invested" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                <Area type="stepAfter" dataKey="value" stroke="#00a884" strokeWidth={2.2} fillOpacity={1} fill="url(#portfolioGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card fintech-card">
        <div className="card-body p-3 p-md-4">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-6 col-md-2.5">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All categories">All categories</option>
                <option value="Mutual Funds">Mutual Funds</option>
                <option value="Stocks">Stocks</option>
                <option value="ETFs">ETFs</option>
                <option value="Gold">Gold</option>
                <option value="Fixed Deposits">Fixed Deposits</option>
              </select>
            </div>

            <div className="col-6 col-md-2.5">
              <select
                className="form-select"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="All risk levels">All risk levels</option>
                <option value="Very Low">Very Low</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
              </select>
            </div>

            <div className="col-12 col-md-2">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="value">Sort: value</option>
                <option value="invested">Sort: invested</option>
                <option value="return">Sort: return</option>
                <option value="name">Sort: name</option>
              </select>
            </div>
          </div>

          <div className="table-responsive fintech-table-wrapper">
            <table className="table table-hover align-middle fintech-table mb-0">
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>Holding</th>
                  <th>Category</th>
                  <th>Risk</th>
                  <th className="text-end">Invested</th>
                  <th className="text-end">Value</th>
                  <th className="text-end">Return</th>
                  <th className="text-end">Weight</th>
                  <th>Valued</th>
                  <th className="text-center" style={{ width: '90px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHoldings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No holdings match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredHoldings.map((h) => {
                    const absReturn = h.value - h.invested;
                    const pctReturn = h.invested > 0 ? (absReturn / h.invested) * 100 : 0;
                    const weight = metrics.portfolioValue > 0 ? ((h.value / metrics.portfolioValue) * 100).toFixed(1) : '0.0';
                    const isPositive = absReturn >= 0;

                    return (
                      <tr key={h.id}>
                        <td>
                          <div className="fw-medium text-dark">{h.name}</div>
                          <div className="text-muted small d-flex align-items-center gap-1.5">
                            <span>{h.subtitle}</span>
                            {h.tag && (
                              <span className="badge-demo-inline">{h.tag}</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="text-secondary small">{h.category}</span>
                        </td>

                        <td>
                          <span className={`badge-risk ${getRiskBadgeClass(h.risk)}`}>
                            {h.risk}
                          </span>
                        </td>

                        <td className="text-end font-numeric fw-medium">
                          {formatINR(h.invested)}
                        </td>

                        <td className="text-end font-numeric fw-semibold">
                          {editingId === h.id ? (
                            <div className="d-flex align-items-center justify-content-end gap-1">
                              <input
                                type="number"
                                className="form-control form-control-sm text-end"
                                style={{ width: '90px' }}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(h.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                autoFocus
                              />
                              <button
                                className="btn btn-sm btn-primary-fintech py-0 px-1"
                                onClick={() => handleSaveEdit(h.id)}
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div>{formatINR(h.value)}</div>
                              {h.isAccrual && (
                                <div className="text-muted" style={{ fontSize: '0.65rem' }}>est. accrued</div>
                              )}
                            </div>
                          )}
                        </td>

                        <td className={`text-end font-numeric ${isPositive ? 'text-success' : 'text-danger'}`}>
                          <div>{formatReturnINR(absReturn)}</div>
                          <div style={{ fontSize: '0.72rem' }}>{formatPercent(pctReturn, true)}</div>
                        </td>

                        <td className="text-end font-numeric text-muted">
                          {weight}%
                        </td>

                        <td className="text-muted small">
                          {h.valuedDate}
                        </td>

                        <td>
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <button
                              className="btn btn-action-icon"
                              title="Invest more (+ ₹10,000)"
                              onClick={() => handleQuickInvest(h)}
                            >
                              <PlusCircle size={15} />
                            </button>
                            <button
                              className="btn btn-action-icon"
                              title="Edit Valuation"
                              onClick={() => {
                                setEditingId(h.id);
                                setEditValue(String(h.value));
                              }}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn btn-action-icon text-danger"
                              title="Delete Holding"
                              onClick={() => deleteHolding(h.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
