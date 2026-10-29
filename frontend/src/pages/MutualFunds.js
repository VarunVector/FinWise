import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancialData } from '../context/FinancialDataContext';
import { useModals } from '../components/layout/MainLayout';
import MetricCard from '../components/common/MetricCard';
import NoticeBanner from '../components/common/NoticeBanner';
import { formatINR, formatReturnINR, formatPercent } from '../utils/formatters';
import {
  Search,
  Plus,
  PlusCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

export default function MutualFunds() {
  const navigate = useNavigate();
  const { holdings, metrics, deleteHolding, updateHolding } = useFinancialData();
  const { openAddHolding } = useModals();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [riskFilter, setRiskFilter] = useState('All risk levels');
  const [sortBy, setSortBy] = useState('value');

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const mfHoldings = useMemo(() => {
    return holdings.filter((h) => h.category === 'Mutual Funds');
  }, [holdings]);

  const mfInvested = mfHoldings.reduce((sum, h) => sum + h.invested, 0);
  const mfValue = mfHoldings.reduce((sum, h) => sum + h.value, 0);
  const mfReturn = mfValue - mfInvested;
  const mfReturnPct = mfInvested > 0 ? (mfReturn / mfInvested) * 100 : 0;
  const shareOfPortfolio = metrics.portfolioValue > 0 ? (mfValue / metrics.portfolioValue) * 100 : 0;

  const MF_COLORS = ['#00a884', '#1e3a8a', '#d97706', '#64748b', '#6366f1'];

  const donutData = mfHoldings.map((h, i) => ({
    name: h.name,
    value: h.value,
    percentage: mfValue > 0 ? (h.value / mfValue) * 100 : 0,
    color: MF_COLORS[i % MF_COLORS.length]
  }));

  const riskMix = useMemo(() => {
    const map = { 'Low': 0, 'Moderate': 0, 'High': 0, 'Very High': 0 };
    mfHoldings.forEach((h) => {
      if (map[h.risk] !== undefined) {
        map[h.risk] += h.value;
      } else {
        map[h.risk] = h.value;
      }
    });

    return Object.entries(map)
      .filter(([_, val]) => val > 0)
      .map(([risk, val]) => ({
        risk,
        value: val,
        percentage: mfValue > 0 ? (val / mfValue) * 100 : 0
      }));
  }, [mfHoldings, mfValue]);

  const filteredMFHoldings = useMemo(() => {
    return mfHoldings
      .filter((h) => {
        const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (h.subtitle && h.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = typeFilter === 'All types' || (h.subtitle && h.subtitle.includes(typeFilter));
        const matchesRisk = riskFilter === 'All risk levels' || h.risk === riskFilter;
        return matchesSearch && matchesType && matchesRisk;
      })
      .sort((a, b) => {
        if (sortBy === 'value') return b.value - a.value;
        if (sortBy === 'invested') return b.invested - a.invested;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'return') return (b.value - b.invested) - (a.value - a.invested);
        return 0;
      });
  }, [mfHoldings, searchQuery, typeFilter, riskFilter, sortBy]);

  const handleQuickInvest = (h) => {
    const additional = 5000;
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

  return (
    <div className="mutual-funds-page d-flex flex-column gap-3.5">
      <NoticeBanner message="Demo data. Current value (NAV × units); values are entered by you and are not live quotes. Returns are unrealised and not guaranteed." />

      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Invested"
            badgeText="Your input"
            badgeType="input"
            value={formatINR(mfInvested)}
            subtext={`${mfHoldings.length} holdings`}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Current value"
            badgeText="Demo data"
            badgeType="demo"
            value={formatINR(mfValue)}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Return"
            badgeText="Calculated"
            badgeType="calc"
            value={formatReturnINR(mfReturn)}
            valueClass="text-success"
            subtext={formatPercent(mfReturnPct, true)}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Share of portfolio"
            badgeText="Calculated"
            badgeType="calc"
            value={`${shareOfPortfolio.toFixed(1)}%`}
            subtext="View portfolio"
            onClick={() => navigate('/portfolio')}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              <h5 className="card-section-title mb-3">Allocation within mutual funds</h5>

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
                        <Cell key={`cell-mf-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [formatINR(val), name]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

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

              <div className="d-flex justify-content-between align-items-center pt-2.5 mt-2 border-top">
                <span className="text-muted small">Total</span>
                <span className="fw-bold text-dark">{formatINR(mfValue)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              <h5 className="card-section-title mb-3">Risk mix</h5>

              <div className="d-flex flex-column gap-3 my-auto">
                {riskMix.map((item) => (
                  <div key={item.risk}>
                    <div className="d-flex justify-content-between align-items-center small mb-1">
                      <span className="text-secondary">{item.risk}</span>
                      <span className="fw-medium font-numeric">
                        {item.percentage.toFixed(0)}% · {formatINR(item.value)}
                      </span>
                    </div>
                    <div className="progress" style={{ height: '7px', borderRadius: '4px' }}>
                      <div
                        className="progress-bar bg-teal"
                        style={{ width: `${item.percentage}%`, borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="small text-muted pt-3 border-top mt-3">
                Moderate risk core with active small-cap satellite exposure for long-term compounding.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card fintech-card">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
            <h5 className="card-section-title m-0">Mutual Funds holdings</h5>
            <button
              className="btn btn-dark-fintech btn-sm d-flex align-items-center gap-1.5 align-self-start"
              onClick={() => openAddHolding('Mutual Funds')}
            >
              <Plus size={16} />
              <span>Add mutual fund</span>
            </button>
          </div>

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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All types">All types</option>
                <option value="Flexi Cap">Flexi Cap</option>
                <option value="Index Fund">Index Fund</option>
                <option value="Small Cap">Small Cap</option>
                <option value="Liquid">Liquid</option>
              </select>
            </div>

            <div className="col-6 col-md-2.5">
              <select
                className="form-select"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="All risk levels">All risk levels</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
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
                {filteredMFHoldings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No mutual funds found.
                    </td>
                  </tr>
                ) : (
                  filteredMFHoldings.map((h) => {
                    const absReturn = h.value - h.invested;
                    const pctReturn = h.invested > 0 ? (absReturn / h.invested) * 100 : 0;
                    const weight = mfValue > 0 ? ((h.value / mfValue) * 100).toFixed(1) : '0.0';

                    return (
                      <tr key={h.id}>
                        <td>
                          <div className="fw-medium text-dark">{h.name}</div>
                          <div className="text-muted small d-flex align-items-center gap-1.5">
                            <span>{h.subtitle}</span>
                            {h.tag && <span className="badge-demo-inline">{h.tag}</span>}
                          </div>
                        </td>

                        <td>
                          <span className={`badge-risk badge-risk-${h.risk.toLowerCase().replace(' ', '-')}`}>
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
                            formatINR(h.value)
                          )}
                        </td>

                        <td className="text-end font-numeric text-success">
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
                              title="Invest more (+ ₹5,000)"
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
