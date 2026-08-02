import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { marketAPI } from '../services/api';
import {
  FiTrendingUp, FiPieChart, FiBarChart2,
  FiRefreshCw, FiArrowUpRight, FiArrowDownRight,
  FiMessageSquare, FiTarget, FiCpu
} from 'react-icons/fi';
import { BiWallet, BiLineChart } from 'react-icons/bi';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const data = await marketAPI.getIndices();
      setMarketData(data.data);
    } catch (err) {
      console.error('Failed to fetch market data:', err);
    } finally {
      setLoading(false);
    }
  };

  const profile = user?.profile;
  const transactions = user?.transactions || [];

  const statsCards = [
    {
      label: 'Total Portfolio Value',
      value: `₹${(profile?.portfolioValue || 0).toLocaleString()}`,
      change: '+13.5%',
      changeType: 'positive',
      icon: <BiWallet />,
      bg: 'rgba(0,168,107,0.1)',
      color: 'var(--primary)'
    },
    {
      label: 'Total Returns',
      value: `₹${(profile?.totalReturns || 0).toLocaleString()}`,
      change: '+₹37,500',
      changeType: 'positive',
      icon: <FiTrendingUp />,
      bg: 'rgba(52,152,219,0.1)',
      color: 'var(--info)'
    },
    {
      label: 'Monthly SIP',
      value: `₹${(profile?.sipAmount || 0).toLocaleString()}`,
      change: 'Active',
      changeType: 'positive',
      icon: <FiBarChart2 />,
      bg: 'rgba(255,179,0,0.1)',
      color: 'var(--accent)'
    },
    {
      label: 'Risk Profile',
      value: profile?.riskProfile ? profile.riskProfile.charAt(0).toUpperCase() + profile.riskProfile.slice(1) : 'Not Set',
      change: profile?.riskProfile === 'aggressive' ? 'High Growth' : profile?.riskProfile === 'conservative' ? 'Stable' : 'Balanced',
      changeType: 'positive',
      icon: <FiPieChart />,
      bg: 'rgba(155,89,182,0.1)',
      color: '#9B59B6'
    }
  ];

  const portfolioAllocation = [
    { label: 'Equity (Mutual Funds)', value: profile?.equityAmount || 875000, color: 'var(--primary)' },
    { label: 'Fixed Deposits', value: profile?.fdAmount || 300000, color: 'var(--info)' },
    { label: 'Stocks', value: profile?.equityAmount ? profile.equityAmount - 500000 : 500000, color: 'var(--accent)' },
  ];

  const totalPortfolio = portfolioAllocation.reduce((sum, item) => sum + item.value, 0);

  const goalInfoMap = {
    retirement: { name: 'Retirement Corpus', emoji: '🏖️', target: '2 Cr' },
    emergency: { name: 'Emergency Fund', emoji: '🛡️', target: '₹6,00,000' },
    wealth: { name: 'Wealth Building', emoji: '📈', target: '₹1 Cr' },
    education: { name: 'Children Education', emoji: '🎓', target: '₹50,00,000' },
    house: { name: 'Buy a Home', emoji: '🏠', target: '₹80,00,000' },
    travel: { name: 'Travel & Lifestyle', emoji: '✈️', target: '₹10,00,000' },
    tax: { name: 'Tax Saving', emoji: '💰', target: '₹1,50,000' },
    sidehustle: { name: 'Side Business', emoji: '🚀', target: '₹5,00,000' },
  };

  const savedGoalMap = {
    retirement: '₹35,00,000',
    emergency: '₹3,50,000',
    wealth: '₹28,00,000',
    education: '₹12,00,000',
    house: '₹15,00,000',
    travel: '₹2,50,000',
    tax: '₹80,000',
    sidehustle: '₹1,50,000',
  };

  const progressMap = {
    retirement: 35,
    emergency: 58,
    wealth: 28,
    education: 24,
    house: 19,
    travel: 25,
    tax: 53,
    sidehustle: 30,
  };

  const userGoals = (profile?.goals || []).length > 0 ? profile.goals : [];
  const goals = userGoals.map(goalId => {
    // Handle custom "other" goals stored as "other: custom text"
    if (goalId.startsWith('other:')) {
      const customText = goalId.replace('other:', '').trim();
      return { name: customText || 'Other Goal', emoji: '📝', target: 'Custom', saved: 'In Progress', progress: 10 };
    }
    const info = goalInfoMap[goalId] || { name: 'Other Goal', emoji: '📝', target: 'Custom' };
    return {
      name: info.name,
      emoji: info.emoji,
      target: info.target,
      saved: savedGoalMap[goalId] || 'In Progress',
      progress: progressMap[goalId] || 10,
    };
  });

  const aiInsights = [
    { type: 'tip', message: 'Increase your SIP by 10% to reach retirement goal 2 years earlier', icon: '💡' },
    { type: 'alert', message: 'Market volatility expected next week. Consider rebalancing portfolio.', icon: '⚠️' },
    { type: 'opportunity', message: 'ELSS tax saving deadline approaching. Invest now to save up to ₹46,800.', icon: '💰' },
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h2>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name || 'Investor'}! 👋</h2>
            <p>Your portfolio is performing well. Here's your financial summary for today.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <button
              className="btn btn-light d-inline-flex align-items-center gap-2 me-2 mb-2 mb-md-0"
              onClick={() => navigate('/stock-prediction')}
              style={{ borderRadius: '12px', padding: '12px 24px', fontWeight: 600 }}
            >
              <FiCpu /> Stock Prediction
            </button>
            <button
              className="btn btn-light d-inline-flex align-items-center gap-2"
              onClick={() => navigate('/ai-advisor')}
              style={{ borderRadius: '12px', padding: '12px 24px', fontWeight: 600 }}
            >
              <FiMessageSquare /> Ask AI Advisor
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {statsCards.map((stat, idx) => (
          <div className="col-md-6 col-lg-3" key={idx}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.changeType}`}>
                {stat.changeType === 'positive' ? <FiArrowUpRight /> : <FiArrowDownRight />}
                {' '}{stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Portfolio Allocation */}
        <div className="col-lg-4">
          <div className="widget-card">
            <div className="widget-title">
              <FiPieChart style={{ color: 'var(--primary)' }} /> Portfolio Allocation
            </div>
            <div className="text-center mb-4">
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                ₹{totalPortfolio.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Total Invested</div>
            </div>
            {portfolioAllocation.map((item, idx) => (
              <div className="mb-3" key={idx}>
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>₹{(item.value / 100000).toFixed(1)}L</span>
                </div>
                <div className="progress-styled progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${(item.value / totalPortfolio) * 100}%`, background: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Overview */}
        <div className="col-lg-4">
          <div className="widget-card">
            <div className="widget-title">
              <FiTrendingUp style={{ color: 'var(--info)' }} /> Market Overview
              <button
                className="btn btn-link ms-auto p-0"
                onClick={fetchMarketData}
                style={{ color: 'var(--text-light)' }}
              >
                <FiRefreshCw />
              </button>
            </div>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
              </div>
            ) : marketData ? (
              <>
                {Object.entries(marketData).map(([key, data]) => (
                  <div className="d-flex justify-content-between align-items-center py-3 border-bottom" key={key}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', textTransform: 'capitalize' }}>
                        {key === 'bankNifty' ? 'Bank Nifty' : key === 'sensex' ? 'SENSEX' : 'NIFTY 50'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontWeight: 600 }}>{data.value.toLocaleString()}</div>
                      <div style={{ fontSize: '0.85rem', color: data.change >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.percentChange.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-4" style={{ color: 'var(--text-light)' }}>
                Unable to load market data
              </div>
            )}
          </div>
        </div>

        {/* Goal Progress */}
        <div className="col-lg-4">
          <div className="widget-card">
            <div className="widget-title">
              <FiTarget style={{ color: 'var(--accent)' }} /> Goal Progress
            </div>
            {goals.map((goal, idx) => (
              <div className="mb-3" key={idx}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <span style={{ marginRight: '4px' }}>{goal.emoji}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{goal.name}</span>
                  </div>
                  <div className="text-end">
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{goal.saved}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>of {goal.target}</div>
                  </div>
                </div>
                <div className="progress-styled progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'right' }}>
                  {goal.progress}% achieved
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights & Recent Transactions */}
      <div className="row g-4 mt-2">
        {/* AI Insights */}
        <div className="col-lg-6">
          <div className="widget-card">
            <div className="widget-title">
              <FiMessageSquare style={{ color: 'var(--primary)' }} /> AI Smart Insights
            </div>
            {aiInsights.map((insight, idx) => (
              <div
                className="d-flex align-items-start gap-3 p-3 mb-2 rounded-3"
                style={{ background: idx % 2 === 0 ? 'rgba(0,168,107,0.05)' : 'transparent' }}
                key={idx}
              >
                <span style={{ fontSize: '1.5rem' }}>{insight.icon}</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '4px' }}>
                    {insight.type === 'tip' ? '💡 Tip' : insight.type === 'alert' ? '⚠️ Alert' : '💰 Opportunity'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {insight.message}
                  </div>
                </div>
              </div>
            ))}
            <button
              className="btn btn-outline-primary w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
              onClick={() => navigate('/ai-advisor')}
              style={{ borderRadius: '12px' }}
            >
              <FiMessageSquare /> Get Personalized Advice
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-lg-6">
          <div className="widget-card">
            <div className="widget-title">
              <BiLineChart style={{ color: 'var(--primary)' }} /> Recent Transactions
            </div>
            {transactions.length > 0 ? (
              <>
                {transactions.slice(0, 6).map((txn) => (
                  <div className="transaction-item" key={txn.id}>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: '36px',
                          height: '36px',
                          background: txn.type === 'credit' ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                          color: txn.type === 'credit' ? 'var(--success)' : 'var(--danger)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {txn.type === 'credit' ? <FiArrowUpRight /> : <FiArrowDownRight />}
                      </div>
                      <div>
                        <div className="transaction-category">{txn.category}</div>
                        <div className="transaction-date">{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div className={`transaction-amount ${txn.type}`}>
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-4" style={{ color: 'var(--text-light)' }}>
                No transactions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

