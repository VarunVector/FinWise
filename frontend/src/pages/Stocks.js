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
  Trash2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

export default function Stocks() {
  const navigate = useNavigate();
  const { holdings, metrics, deleteHolding, updateHolding } = useFinancialData();
  const { openAddHolding } = useModals();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('value');

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const stockHoldings = useMemo(() => {
    return holdings.filter((h) => h.category === 'Stocks');
  }, [holdings]);

  const stockInvested = stockHoldings.reduce((sum, h) => sum + h.invested, 0);
  const stockValue = stockHoldings.reduce((sum, h) => sum + h.value, 0);
  const stockReturn = stockValue - stockInvested;
  const stockReturnPct = stockInvested > 0 ? (stockReturn / stockInvested) * 100 : 0;
  const shareOfPortfolio = metrics.portfolioValue > 0 ? (stockValue / metrics.portfolioValue) * 100 : 0;

  const STOCK_COLORS = ['#1e3a8a', '#00a884', '#d97706', '#64748b'];

  const donutData = stockHoldings.map((h, i) => ({
    name: h.name,
    value: h.value,
    percentage: stockValue > 0 ? (h.value / stockValue) * 100 : 0,
    color: STOCK_COLORS[i % STOCK_COLORS.length]
  }));

  const filteredHoldings = useMemo(() => {
    return stockHoldings
      .filter((h) => {
        return h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (h.subtitle && h.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      })
      .sort((a, b) => {
        if (sortBy === 'value') return b.value - a.value;
        if (sortBy === 'invested') return b.invested - a.invested;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'return') return (b.value - b.invested) - (a.value - a.invested);
        return 0;
      });
  }, [stockHoldings, searchQuery, sortBy]);

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

  return (
    <div className="stocks-page d-flex flex-column gap-3.5">
      <NoticeBanner message="Demo data. Live market prices and stock fundamentals are simulated for testing. Connect your broker API for live execution." />

      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Invested"
            badgeText="Your input"
            badgeType="input"
            value={formatINR(stockInvested)}
            subtext={`${stockHoldings.length} stocks`}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Current value"
            badgeText="Demo data"
            badgeType="demo"
            value={formatINR(stockValue)}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Return"
            badgeText="Calculated"
            badgeType="calc"
            value={formatReturnINR(stockReturn)}
            valueClass={stockReturn >= 0 ? 'text-success' : 'text-danger'}
            subtext={formatPercent(stockReturnPct, true)}
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

      <div className="card fintech-card bg-gradient-soft border-primary">
        <div className="card-body p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2.5 rounded-3 bg-primary text-white flex-shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <h6 className="fw-semibold text-dark mb-1">AI LSTM Stock Forecasting Available</h6>
              <p className="small text-muted mb-0">
                Run our trained Long Short-Term Memory neural network across top NIFTY 50 securities with confidence scores and target signals.
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary-fintech btn-sm d-flex align-items-center gap-1.5 flex-shrink-0"
            onClick={() => navigate('/stock-prediction')}
          >
            <Sparkles size={16} />
            <span>Open LSTM Predictions</span>
          </button>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              <h5 className="card-section-title mb-3">Direct Equities Mix</h5>

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
                        <Cell key={`cell-stock-${index}`} fill={entry.color} />
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
                <span className="fw-bold text-dark">{formatINR(stockValue)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-section-title m-0">Stocks portfolio</h5>
                <button
                  className="btn btn-dark-fintech btn-sm d-flex align-items-center gap-1.5"
                  onClick={() => openAddHolding('Stocks')}
                >
                  <Plus size={16} />
                  <span>Add stock</span>
                </button>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12 col-sm-8">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search stocks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-4">
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
                      <th>Stock</th>
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
                      const isPositive = absReturn >= 0;

                      return (
                        <tr key={h.id}>
                          <td>
                            <div className="fw-medium text-dark">{h.name}</div>
                            <div className="text-muted small">{h.subtitle}</div>
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
                                  style={{ width: '85px' }}
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
                          <td className={`text-end font-numeric ${isPositive ? 'text-success' : 'text-danger'}`}>
                            <div>{formatReturnINR(absReturn)}</div>
                            <div style={{ fontSize: '0.72rem' }}>{formatPercent(pctReturn, true)}</div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              <button
                                className="btn btn-action-icon"
                                title="Buy more (+ ₹10,000)"
                                onClick={() => handleQuickInvest(h)}
                              >
                                <PlusCircle size={15} />
                              </button>
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
