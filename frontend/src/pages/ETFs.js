import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancialData } from '../context/FinancialDataContext';
import { useModals } from '../components/layout/MainLayout';
import MetricCard from '../components/common/MetricCard';
import NoticeBanner from '../components/common/NoticeBanner';
import { formatINR, formatReturnINR, formatPercent } from '../utils/formatters';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function ETFs() {
  const navigate = useNavigate();
  const { holdings, metrics, deleteHolding, updateHolding } = useFinancialData();
  const { openAddHolding } = useModals();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const etfHoldings = useMemo(() => {
    return holdings.filter((h) => h.category === 'ETFs');
  }, [holdings]);

  const etfInvested = etfHoldings.reduce((sum, h) => sum + h.invested, 0);
  const etfValue = etfHoldings.reduce((sum, h) => sum + h.value, 0);
  const etfReturn = etfValue - etfInvested;
  const etfReturnPct = etfInvested > 0 ? (etfReturn / etfInvested) * 100 : 0;
  const shareOfPortfolio = metrics.portfolioValue > 0 ? (etfValue / metrics.portfolioValue) * 100 : 0;

  const ETF_COLORS = ['#475569', '#d97706', '#00a884'];

  const donutData = etfHoldings.map((h, i) => ({
    name: h.name,
    value: h.value,
    percentage: etfValue > 0 ? (h.value / etfValue) * 100 : 0,
    color: ETF_COLORS[i % ETF_COLORS.length]
  }));

  const filteredHoldings = useMemo(() => {
    return etfHoldings.filter((h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.subtitle && h.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [etfHoldings, searchQuery]);

  const handleSaveEdit = (id) => {
    const num = Number(editValue);
    if (!isNaN(num) && num > 0) {
      updateHolding(id, { value: num });
    }
    setEditingId(null);
  };

  return (
    <div className="etfs-page d-flex flex-column gap-3.5">
      <NoticeBanner message="Demo data. Exchange Traded Funds trade in real-time on NSE/BSE. Values reflect stored valuations and simulated price drift." />

      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Invested"
            badgeText="Your input"
            badgeType="input"
            value={formatINR(etfInvested)}
            subtext={`${etfHoldings.length} ETFs`}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Current value"
            badgeText="Demo data"
            badgeType="demo"
            value={formatINR(etfValue)}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Return"
            badgeText="Calculated"
            badgeType="calc"
            value={formatReturnINR(etfReturn)}
            valueClass={etfReturn >= 0 ? 'text-success' : 'text-danger'}
            subtext={formatPercent(etfReturnPct, true)}
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
        {/* Allocation */}
        <div className="col-12 col-lg-5">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              <h5 className="card-section-title mb-3">ETF Breakdown</h5>

              <div className="d-flex align-items-center justify-content-center my-2" style={{ height: '160px' }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={donutData} innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-etf-${index}`} fill={entry.color} />
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
                <span className="fw-bold text-dark">{formatINR(etfValue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="col-12 col-lg-7">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-section-title m-0">ETFs holdings</h5>
                <button
                  className="btn btn-dark-fintech btn-sm d-flex align-items-center gap-1.5"
                  onClick={() => openAddHolding('ETFs')}
                >
                  <Plus size={16} />
                  <span>Add ETF</span>
                </button>
              </div>

              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search ETFs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-responsive fintech-table-wrapper">
                <table className="table table-hover align-middle fintech-table mb-0">
                  <thead>
                    <tr>
                      <th>ETF Scheme</th>
                      <th className="text-end">Invested</th>
                      <th className="text-end">Value</th>
                      <th className="text-end">Return</th>
                      <th className="text-center" style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHoldings.map((h) => {
                      const absReturn = h.value - h.invested;
                      const pctReturn = h.invested > 0 ? (absReturn / h.invested) * 100 : 0;
                      return (
                        <tr key={h.id}>
                          <td>
                            <div className="fw-medium text-dark">{h.name}</div>
                            <div className="text-muted small">{h.subtitle}</div>
                          </td>
                          <td className="text-end font-numeric fw-medium">{formatINR(h.invested)}</td>
                          <td className="text-end font-numeric fw-semibold">
                            {editingId === h.id ? (
                              <div className="d-flex align-items-center justify-content-end gap-1">
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-end"
                                  style={{ width: '85px' }}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit(h.id);
                                    if (e.key === 'Escape') setEditingId(null);
                                  }}
                                  autoFocus
                                />
                                <button className="btn btn-sm btn-primary-fintech py-0 px-1" onClick={() => handleSaveEdit(h.id)}>
                                  ✓
                                </button>
                              </div>
                            ) : (
                              formatINR(h.value)
                            )}
                          </td>
                          <td className={`text-end font-numeric ${absReturn >= 0 ? 'text-success' : 'text-danger'}`}>
                            <div>{formatReturnINR(absReturn)}</div>
                            <div style={{ fontSize: '0.72rem' }}>{formatPercent(pctReturn, true)}</div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              <button
                                className="btn btn-action-icon"
                                title="Edit valuation"
                                onClick={() => {
                                  setEditingId(h.id);
                                  setEditValue(String(h.value));
                                }}
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                className="btn btn-action-icon text-danger"
                                title="Delete"
                                onClick={() => deleteHolding(h.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
