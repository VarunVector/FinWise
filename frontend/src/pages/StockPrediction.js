import React, { useState, useEffect } from "react";
import { TrendingUp, Activity, BarChart3, Search, AlertCircle, Loader2, Newspaper, ExternalLink, LineChart, ArrowLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { stockPredictionAPI } from '../services/api';
import './StockPrediction.css';

export default function StockPrediction() {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStock, setSelectedStock] = useState(null);
    const [dataSource, setDataSource] = useState("live");

    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                // Try real backend first, fall back to mock API
                let data = null;
                let source = "demo";
                try {
                    const res = await fetch("http://localhost:5000/api/stocks/predictions");
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.message || "Failed to fetch predictions");
                    data = json.data;
                    source = "live";
                } catch (err) {
                    // Backend unavailable - use mock data
                    console.warn("Live backend unavailable, falling back to demo data:", err);
                    const mockRes = await stockPredictionAPI.getPredictions();
                    data = mockRes.data;
                    source = "demo";
                }

                // Set data and default selection
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

    const top5 = [...stocks].sort((a, b) => b.expected_return - a.expected_return).slice(0, 5);

    if (loading) {
        return (
            <div className="sp-loading flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <h3 className="text-xl font-bold text-white">Generating LSTM Predictions...</h3>
                <p className="text-zinc-500">Analyzing Top NIFTY 50 Stocks with your Custom Model</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="sp-error flex items-start gap-4">
                <AlertCircle size={24} className="mt-1 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-lg text-white">Predictions Unavailable</h3>
                    <p className="opacity-80">{error}</p>
                    <p className="text-sm mt-2 opacity-60">Make sure you have run the `generate_predictions.py` script.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sp-container">
            {/* Back button */}
            <button className="sp-back-btn" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={16} />
                Back to Dashboard
            </button>

            {/* Header */}
            <div className="sp-header">
                <div>
                    <h1 className="sp-title">LSTM Market Prediction</h1>
                    <p className="sp-subtitle">Live AI Forecasting for NIFTY 50</p>
                    <div className="sp-datasource-row">
                        <span className={`sp-datasource-badge ${dataSource === 'live' ? 'live' : 'demo'}`}>
                            {dataSource === 'live' ? (
                                <>
                                    <span className="sp-pulse-dot"></span> Live LSTM Data
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={14} /> Demo Data
                                </>
                            )}
                        </span>
                    </div>
                </div>

                <div className="sp-search-wrap">
                    <Search className="sp-search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search stock ticker..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="sp-search-input"
                    />
                </div>
            </div>

            <div className="sp-grid">
                {/* Main Graph & List */}
                <div className="sp-main-col">
                    {/* Graph Section */}
                    {selectedStock && (
                        <div className="sp-card">
                            <div className="sp-card-bg-icon">
                                <BarChart3 size={120} />
                            </div>

                            <div className="sp-graph-header">
                                <div>
                                    <h2 className="sp-symbol-title">{selectedStock.symbol}</h2>
                                    <p className="sp-live-row">
                                        Live: <span className="sp-live-price">₹{selectedStock.live_price}</span>
                                        <span className="sp-sep">•</span>
                                        Predicted: <span className={`sp-pred-price ${selectedStock.signal === 'BUY' ? 'green' : 'red'}`}>₹{selectedStock.predicted_price}</span>
                                    </p>
                                </div>
                                <div className={`sp-signal ${selectedStock.signal === 'BUY' ? 'buy' : 'sell'}`}>
                                    <Activity size={18} />
                                    {selectedStock.signal} SIGNAL
                                </div>
                            </div>

                            <div className="sp-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={selectedStock.graph_data}>
                                        <defs>
                                            <linearGradient id="colorPriceBuy" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorPriceSell" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#71717a', fontSize: 12 }}
                                            tickFormatter={(val) => val === 'Next Day' ? 'Predict' : val.split('-').slice(1).join('/')}
                                            minTickGap={20}
                                        />
                                        <YAxis
                                            domain={['auto', 'auto']}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#71717a', fontSize: 12 }}
                                            tickFormatter={val => `₹${val}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke={selectedStock.signal === 'BUY' ? '#4ade80' : '#f87171'}
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill={`url(#${selectedStock.signal === 'BUY' ? 'colorPriceBuy' : 'colorPriceSell'})`}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* News Section */}
                    {selectedStock && selectedStock.news && selectedStock.news.length > 0 && (
                        <div className="sp-card">
                            <div className="sp-news-header">
                                <div className="sp-news-icon">
                                    <Newspaper size={20} />
                                </div>
                                <h3 className="sp-news-title">Latest Market Sentiment</h3>
                            </div>

                            <div className="sp-news-grid">
                                {selectedStock.news.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="sp-news-item"
                                    >
                                        <div className="sp-news-top">
                                            <span className="sp-news-source">{item.source}</span>
                                            <ExternalLink size={12} className="sp-news-ext" />
                                        </div>
                                        <h4 className="sp-news-headline">
                                            {item.title}
                                        </h4>
                                        <p className="sp-news-date">
                                            {new Date(item.publishedAt).toLocaleDateString()}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock List */}
                    <div className="sp-card sp-list-card">
                        <div className="sp-list-header">
                            <h3 className="sp-list-title">All Predictions List</h3>
                        </div>
                        <div className="sp-table-wrap">
                            <table className="sp-table">
                                <thead>
                                    <tr className="sp-table-head">
                                        <th>Symbol</th>
                                        <th>Live Price</th>
                                        <th>Next Day Predict</th>
                                        <th className="text-center">Return (%)</th>
                                        <th>Accuracy</th>
                                        <th>Signal</th>
                                    </tr>
                                </thead>
                                <tbody className="sp-table-body">
                                    {filteredStocks.map((stock, i) => (
                                        <tr
                                            key={i}
                                            onClick={() => setSelectedStock(stock)}
                                            className={`sp-table-row ${selectedStock?.symbol === stock.symbol ? 'active' : ''}`}
                                        >
                                            <td className="sp-td-symbol">
                                                <p className="sp-td-symbol-text">{stock.symbol}</p>
                                            </td>
                                            <td className="sp-td-live">₹{stock.live_price}</td>
                                            <td className="sp-td-pred">₹{stock.predicted_price}</td>
                                            <td className="text-center">
                                                <span className={`sp-td-return ${stock.expected_return >= 0 ? 'green' : 'red'}`}>
                                                    {stock.expected_return > 0 ? '+' : ''}{stock.expected_return}%
                                                </span>
                                            </td>
                                            <td className="sp-td-acc">
                                                <div className="sp-acc-bar-wrap">
                                                    <div className="sp-acc-bar-bg">
                                                        <div className="sp-acc-bar-fill" style={{ width: `${stock.confidence}%` }}></div>
                                                    </div>
                                                    <span className="sp-acc-text">{stock.confidence}%</span>
                                                </div>
                                            </td>
                                            <td className="sp-td-signal">
                                                <span className={`sp-signal-tag ${stock.signal === 'BUY' ? 'buy' : 'sell'}`}>
                                                    {stock.signal}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredStocks.length === 0 && (
                                <div className="sp-empty">No stocks found matching your search.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="sp-side-col">
                    {/* Top 5 Highlight */}
                    <div className="sp-card sp-top5-card">
                        <div className="sp-top5-header">
                            <div className="sp-top5-icon">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="sp-top5-title">Top 5 Confidence Picks</h3>
                        </div>

                        <div className="sp-top5-list">
                            {top5.map((stock, idx) => (
                                <div
                                    key={stock.symbol}
                                    onClick={() => setSelectedStock(stock)}
                                    className="sp-top5-item"
                                >
                                    <div className="sp-top5-left">
                                        <span className="sp-top5-rank">{idx + 1}</span>
                                        <div>
                                            <p className="sp-top5-symbol">{stock.symbol}</p>
                                            <div className="sp-top5-meta">
                                                <Activity size={10} /> {stock.confidence}% Acc | {stock.expected_return > 0 ? '+' : ''}{stock.expected_return}% Return
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sp-top5-right">
                                        <p className="sp-top5-price">₹{stock.predicted_price}</p>
                                        <p className={`sp-top5-signal ${stock.signal === 'BUY' ? 'green' : 'red'}`}>{stock.signal}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sp-card sp-model-card">
                        <div className="sp-model-head">
                            <LineChart className="sp-model-icon" size={20} />
                            <h4 className="sp-model-title">LSTM Model Architecture</h4>
                        </div>
                        <p className="sp-model-desc">
                            Predictions are powered by a custom deep learning LSTM network using historical Yahoo Finance data and global indicators (S&P500, Nikkei, VIX).
                        </p>
                        <div className="sp-model-details">
                            <div className="sp-model-row">
                                <span className="sp-model-label">History Window</span>
                                <span className="sp-model-value">60 Days</span>
                            </div>
                            <div className="sp-model-row">
                                <span className="sp-model-label">Layers</span>
                                <span className="sp-model-value">64-unit LSTM + Dense</span>
                            </div>
                            <div className="sp-model-row">
                                <span className="sp-model-label">Optimizer</span>
                                <span className="sp-model-value">Adam</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

