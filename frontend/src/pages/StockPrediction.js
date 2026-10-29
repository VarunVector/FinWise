import React, { useState, useEffect } from "react";
import {
  Search,
  AlertCircle,
  Loader2,
  Newspaper,
  ExternalLink
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { stockPredictionAPI } from '../services/api';
import NoticeBanner from '../components/common/NoticeBanner';
import MetricCard from '../components/common/MetricCard';
import { formatINR, formatPercent } from '../utils/formatters';

export default function StockPrediction() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const [dataSource, setDataSource] = useState("live");

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        let data = null;
        let source = "demo";
        try {
          const res = await fetch("http://localhost:5000/api/stocks/predictions");
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || "Failed to fetch predictions");
          data = json.data;
          source = "live";
        } catch (err) {
          console.warn("Live backend unavailable, falling back to mock predictions dataset:", err);
          const mockRes = await stockPredictionAPI.getPredictions();
          data = mockRes.data;
          source = "demo";
        }

        setStocks(data || []);
        setDataSource(source);
        if (data && data.length > 0) {
          setSelectedStock(data[0]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  const filteredStocks = stocks.filter(s =>
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
        <Loader2 className="animate-spin text-teal mb-3" size={40} />
        <h5 className="fw-semibold text-dark">Generating LSTM Forecasts...</h5>
        <p className="text-muted small">Querying trained neural network predictions across NIFTY 50 securities</p>
      </div>
    );
  }

  if (error && (!stocks || stocks.length === 0)) {
    return (
      <div className="alert alert-warning d-flex align-items-start gap-3 p-4">
        <AlertCircle size={24} className="text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h6 className="fw-bold">Predictions Service Offline</h6>
          <p className="small mb-1">{error}</p>
          <p className="small text-muted mb-0">Ensure `generate_predictions.py` has been executed or test using demo data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-prediction-page d-flex flex-column gap-3.5">
      <NoticeBanner message="LSTM Market Predictions. Forecasts are generated using 60-day sequence regression models for educational research; not SEBI trading advice." />

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
        <div>
          <h1 className="page-heading-title mb-1">LSTM Market Predictions</h1>
          <div className="page-heading-subtitle text-muted">
            Deep Learning AI Forecasting for Top Indian NIFTY 50 Equities
          </div>
        </div>

        <span className={`badge ${dataSource === 'live' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} py-2 px-3`}>
          ● {dataSource === 'live' ? 'Live LSTM Backend' : 'Demo Prediction Dataset'}
        </span>
      </div>

      {selectedStock && (
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-xl-3">
            <MetricCard
              title={`${selectedStock.symbol} Live Price`}
              badgeText="NSE"
              badgeType="demo"
              value={formatINR(selectedStock.live_price, true, 2)}
            />
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <MetricCard
              title="Next-Day Forecast"
              badgeText="LSTM"
              badgeType="estimate"
              value={formatINR(selectedStock.predicted_price, true, 2)}
              valueClass="text-primary"
            />
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <MetricCard
              title="Expected Return"
              badgeText="Calculated"
              badgeType="calc"
              value={formatPercent(selectedStock.expected_return, true)}
              valueClass={selectedStock.expected_return >= 0 ? 'text-success' : 'text-danger'}
              subtext={`Signal: ${selectedStock.signal}`}
            />
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <MetricCard
              title="Model Confidence"
              badgeText="Accuracy"
              badgeType="calc"
              value={`${selectedStock.confidence}%`}
              valueClass="text-teal"
              subtext="Validation R² metric"
            />
          </div>
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column">
              <h5 className="card-section-title mb-3">NIFTY 50 Securities</h5>

              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Search size={15} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search stock ticker..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="stock-list-container custom-scrollbar d-flex flex-column gap-2" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                {filteredStocks.map((stock) => {
                  const isSelected = selectedStock?.symbol === stock.symbol;
                  const isPositive = stock.expected_return >= 0;

                  return (
                    <div
                      key={stock.symbol}
                      className={`p-2.5 rounded-3 border cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary-subtle' : 'bg-light hover-bg'}`}
                      onClick={() => setSelectedStock(stock)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold text-dark small">{stock.symbol}</div>
                          <div className="text-muted font-numeric" style={{ fontSize: '0.75rem' }}>
                            {formatINR(stock.live_price, true, 2)}
                          </div>
                        </div>

                        <div className="text-end">
                          <span className={`badge ${stock.signal === 'BUY' ? 'bg-success text-white' : 'bg-danger text-white'} mb-1`} style={{ fontSize: '0.65rem' }}>
                            {stock.signal}
                          </span>
                          <div className={`font-numeric small fw-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                            {formatPercent(stock.expected_return, true)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card fintech-card h-100">
            <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
              {selectedStock && (
                <>
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="card-section-title m-0">
                          {selectedStock.symbol} 60-Day Sequence & Forecast
                        </h5>
                        <div className="text-muted small mt-0.5">
                          Predicted next-session price: <strong>{formatINR(selectedStock.predicted_price, true, 2)}</strong>
                        </div>
                      </div>

                      <span className="badge badge-fintech-estimate">
                        Confidence: {selectedStock.confidence}%
                      </span>
                    </div>

                    <div style={{ height: '260px' }}>
                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={selectedStock.graph_data || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 10 }} />
                          <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                          <Tooltip
                            formatter={(val) => [formatINR(val, true, 2), 'Price']}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                          />
                          <Area type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#stockGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="pt-3 border-top mt-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Newspaper size={16} className="text-teal" />
                      <h6 className="card-section-title m-0">Recent Market Catalysts & Sentiment</h6>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {selectedStock.news && selectedStock.news.length > 0 ? (
                        selectedStock.news.map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-medium text-dark small">{item.title}</div>
                              <span className="text-muted" style={{ fontSize: '0.72rem' }}>{item.source} · Recent report</span>
                            </div>
                            <ExternalLink size={14} className="text-muted flex-shrink-0 ms-2" />
                          </div>
                        ))
                      ) : (
                        <div className="text-muted small">No recent reports found for this security.</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
