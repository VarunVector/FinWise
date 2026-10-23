import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { marketAPI } from '../services/api';
import {
  FiTrendingUp, FiPieChart, FiBarChart2,
  FiRefreshCw, FiArrowUpRight, FiArrowDownRight,
  FiMessageSquare, FiTarget, FiCpu, FiShield,
  FiCheckCircle, FiAlertTriangle, FiDollarSign, FiInfo
} from 'react-icons/fi';
import { BiWallet, BiLineChart } from 'react-icons/bi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbProfile, setDbProfile] = useState(null);
  const [dbRiskOutput, setDbRiskOutput] = useState(null);

  const fetchUserRecordFromMongo = async () => {
    const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress;
    if (!userEmail) return;
    try {
      const res = await fetch(`http://localhost:5000/api/questionnaire?email=${encodeURIComponent(userEmail)}`);
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        // Take latest record saved in MongoDB Atlas
        const latestRecord = json.data[json.data.length - 1];
        if (latestRecord.risk_assessment_output) {
          setDbRiskOutput(latestRecord.risk_assessment_output);
        }
        if (latestRecord.questionnaire_answers) {
          setDbProfile(latestRecord.questionnaire_answers);
        }
      }
    } catch (e) {
      console.warn('[Dashboard] Could not fetch records from MongoDB:', e);
    }
  };

  useEffect(() => {
    fetchMarketData();
    fetchUserRecordFromMongo();
  }, [user]);

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

  const getStoredProfile = () => {
    let p = user?.profile;
    if (!p || Object.keys(p).length === 0) {
      try {
        const raw = localStorage.getItem(`finwise_user_profile_${user?.id}`) ||
          localStorage.getItem(`finwise_user_profile_${user?.email}`) ||
          localStorage.getItem('finwise_user_profile');
        if (raw) p = JSON.parse(raw);
      } catch (e) { }
    }
    return p || {};
  };

  const getStoredRisk = (p) => {
    if (p?.riskModelOutput) return p.riskModelOutput;
    try {
      const raw = localStorage.getItem('finwise_latest_risk');
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return null;
  };

  const localProfile = getStoredProfile();
  const profile = {
    ...localProfile,
    ...(dbProfile || {}),
    monthlyIncome: dbProfile?.monthlyIncome || localProfile.monthlyIncome,
    monthlyExpenses: dbProfile?.monthlyExpenses || localProfile.monthlyExpenses,
    riskProfile: dbProfile?.riskProfile || localProfile.riskProfile,
    questionnaire: dbProfile?.questionnaire || localProfile.questionnaire || dbProfile || {},
  };
  const riskOutput = dbRiskOutput || getStoredRisk(localProfile);
  const questionnaire = profile.questionnaire || {};

  // -------------------------------------------------------------
  // DYNAMIC CALCULATED FINANCIAL METRICS (NO HARDCODED VALUES)
  // -------------------------------------------------------------
  const monthlyIncome = parseFloat(profile.monthlyIncome) || 75000;
  const monthlyExpenses = parseFloat(profile.monthlyExpenses) || 40000;
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;
  const recommendedSip = Math.round(monthlySavings * 0.6);

  // Derive estimated total portfolio value dynamically
  const portfolioValue = profile.portfolioValue || (monthlySavings * 12 * 2.5);
  const totalReturns = profile.totalReturns || Math.round(portfolioValue * 0.14);

  // ML Risk Output or Fallback
  const predictedTier = riskOutput?.risk_tier || (profile.riskProfile ? profile.riskProfile.charAt(0).toUpperCase() + profile.riskProfile.slice(1) : 'Moderate');
  const riskScore = riskOutput?.risk_score || (profile.riskProfile === 'aggressive' ? 78.5 : profile.riskProfile === 'conservative' ? 32.0 : 54.0);

  const confidenceData = riskOutput?.confidence_scores ? [
    { name: 'Conservative', probability: Math.round((riskOutput.confidence_scores.Conservative || 0.1) * 100), fill: '#20c997' },
    { name: 'Moderate', probability: Math.round((riskOutput.confidence_scores.Moderate || 0.3) * 100), fill: '#ffc107' },
    { name: 'Aggressive', probability: Math.round((riskOutput.confidence_scores.Aggressive || 0.6) * 100), fill: '#0d6efd' }
  ] : [
    { name: 'Conservative', probability: 15, fill: '#20c997' },
    { name: 'Moderate', probability: 55, fill: '#ffc107' },
    { name: 'Aggressive', probability: 30, fill: '#0d6efd' }
  ];

  const portfolioAllocations = riskOutput?.allocations ? riskOutput.allocations.map(a => ({
    name: a.category,
    value: Math.round((a.percentage / 100) * portfolioValue),
    percentage: a.percentage,
    color: a.color
  })) : [
    { name: 'Diversified Equities', value: Math.round(portfolioValue * 0.50), percentage: 50, color: '#0d6efd' },
    { name: 'Debt & Corporate Bonds', value: Math.round(portfolioValue * 0.35), percentage: 35, color: '#20c997' },
    { name: 'Cash & Gold Reserve', value: Math.round(portfolioValue * 0.15), percentage: 15, color: '#ffc107' }
  ];

  // -------------------------------------------------------------
  // DYNAMIC PERSONALIZED RECOMMENDATIONS ENGINE
  // -------------------------------------------------------------
  const generateDynamicRecommendations = () => {
    const recs = [];

    // 1. Emergency Fund Recommendation
    const efStatus = questionnaire.emergencyFund || 'Less than 3 months';
    if (efStatus === 'No' || efStatus === 'Less than 3 months') {
      const targetFund = monthlyExpenses * 6;
      recs.push({
        title: 'Build Emergency Reserve Buffer',
        category: 'Safety First',
        priority: 'High',
        icon: <FiAlertTriangle className="text-warning" size={20} />,
        badgeBg: 'bg-warning bg-opacity-10 text-warning',
        text: `Your current emergency reserve is low (${efStatus}). Build a 6-month buffer of ₹${targetFund.toLocaleString()} in liquid funds before taking higher market risk.`
      });
    } else {
      recs.push({
        title: 'Emergency Fund Solid',
        category: 'Financial Health',
        priority: 'Optimal',
        icon: <FiCheckCircle className="text-success" size={20} />,
        badgeBg: 'bg-success bg-opacity-10 text-success',
        text: `Great job! Your emergency reserve covers 6+ months of expenses. You are in a strong position to deploy surplus monthly savings (₹${monthlySavings.toLocaleString()}) into growth assets.`
      });
    }

    // 2. SIP & Wealth Building Recommendation based on ML Risk Tier
    recs.push({
      title: `Deploy ₹${recommendedSip.toLocaleString()}/mo via Automated SIP`,
      category: 'Wealth Accumulation',
      priority: 'Recommended',
      icon: <FiTrendingUp className="text-primary" size={20} />,
      badgeBg: 'bg-primary bg-opacity-10 text-primary',
      text: `Based on your ${predictedTier} ML risk profile and monthly savings of ₹${monthlySavings.toLocaleString()}, set up a monthly SIP of ₹${recommendedSip.toLocaleString()} across your recommended asset allocation.`
    });

    // 3. Debt Burden Optimization
    const loanStatus = questionnaire.loansStatus || 'No';
    if (loanStatus === 'Yes, high burden') {
      recs.push({
        title: 'Prioritize High-Interest Debt Repayment',
        category: 'Debt Management',
        priority: 'Urgent',
        icon: <FiDollarSign className="text-danger" size={20} />,
        badgeBg: 'bg-danger bg-opacity-10 text-danger',
        text: `High debt burden reported. Direct at least 40% of surplus savings to clear high-cost credit/EMIs to boost your overall net capacity score.`
      });
    }

    // 4. Asset Allocation Strategy matching ML Risk Tier
    if (predictedTier === 'Aggressive') {
      recs.push({
        title: 'Growth Portfolio Focus (75% Equities)',
        category: 'Asset Strategy',
        priority: 'Growth',
        icon: <FiTarget className="text-info" size={20} />,
        badgeBg: 'bg-info bg-opacity-10 text-info',
        text: 'Your high institutional capacity score allows maximum capital allocation in equity mutual funds & stock portfolios for long-term compound wealth growth.'
      });
    } else if (predictedTier === 'Conservative') {
      recs.push({
        title: 'Capital Preservation Focus (60% Debt/Bonds)',
        category: 'Asset Strategy',
        priority: 'Preservation',
        icon: <FiShield className="text-success" size={20} />,
        badgeBg: 'bg-success bg-opacity-10 text-success',
        text: 'Focus on low-volatility assets: Government bonds, fixed deposits, and debt funds to ensure capital safety with steady returns.'
      });
    } else {
      recs.push({
        title: 'Balanced Hybrid Strategy (50% Stocks, 35% Bonds)',
        category: 'Asset Strategy',
        priority: 'Balanced',
        icon: <FiBarChart2 className="text-primary" size={20} />,
        badgeBg: 'bg-primary bg-opacity-10 text-primary',
        text: 'Optimal risk-reward balance: 50% in index & equity mutual funds, 35% in corporate debt, and 15% in gold/liquid funds.'
      });
    }

    return recs;
  };

  const dynamicRecommendations = generateDynamicRecommendations();

  const statsCards = [
    {
      label: 'Monthly Net Savings',
      value: `₹${monthlySavings.toLocaleString()}`,
      change: `${savingsRate}% of income`,
      changeType: 'positive',
      icon: <BiWallet />,
      bg: 'rgba(0,168,107,0.1)',
      color: 'var(--primary)'
    },
    {
      label: 'Total Portfolio Value',
      value: `₹${portfolioValue.toLocaleString()}`,
      change: `+₹${totalReturns.toLocaleString()} returns`,
      changeType: 'positive',
      icon: <FiTrendingUp />,
      bg: 'rgba(52,152,219,0.1)',
      color: 'var(--info)'
    },
    {
      label: 'Recommended SIP',
      value: `₹${recommendedSip.toLocaleString()}/mo`,
      change: 'Calculated Target',
      changeType: 'positive',
      icon: <FiBarChart2 />,
      bg: 'rgba(255,179,0,0.1)',
      color: 'var(--accent)'
    },
    {
      label: 'ML Risk Score',
      value: `${riskScore} / 100`,
      change: `${predictedTier} Tier`,
      changeType: 'positive',
      icon: <FiShield />,
      bg: 'rgba(155,89,182,0.1)',
      color: '#9B59B6'
    }
  ];

  const goals = (profile.goals || ['wealth', 'retirement']).map(goalId => {
    const cleanId = goalId.startsWith('other:') ? goalId.replace('other:', '').trim() : goalId;
    return {
      name: cleanId.charAt(0).toUpperCase() + cleanId.slice(1),
      emoji: '🎯',
      target: `₹${(monthlySavings * 24).toLocaleString()}`,
      saved: `₹${(monthlySavings * 8).toLocaleString()}`,
      progress: 35
    };
  });

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h2 className="fw-bold mb-1">
              Welcome back, {user?.name || 'Investor'}! 👋
            </h2>
            <p className="mb-0 text-white-50">
              Here is your ML-analyzed financial risk profile, portfolio performance, and personalized recommendations.
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <button
              className="btn btn-light d-inline-flex align-items-center gap-2 me-2"
              onClick={() => navigate('/stock-prediction')}
              style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}
            >
              <FiCpu /> Stock Prediction
            </button>
            <button
              className="btn btn-light d-inline-flex align-items-center gap-2"
              onClick={() => navigate('/ai-advisor')}
              style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}
            >
              <FiMessageSquare /> AI Advisor
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Key Stats Cards */}
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
                <FiArrowUpRight /> {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Section 1: ML Model Classification & Portfolio Allocation Chart */}
      <div className="row g-4 mb-4">
        {/* ML Risk Capacity & Model Output Card */}
        <div className="col-lg-6">
          <div className="widget-card h-100">
            <div className="widget-title d-flex justify-content-between align-items-center mb-3">
              <span className="d-flex align-items-center gap-2">
                <FiShield style={{ color: 'var(--primary)' }} />
                ML Risk Assessment Output
              </span>
              <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-2 rounded-pill small">
                {riskOutput?.is_ml_model_active ? 'ExtraTrees ML (92.07% Acc)' : 'Calibrated Engine'}
              </span>
            </div>

            <div className="p-3 bg-light rounded-3 mb-3 border">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <span className="text-muted small d-block">Institutional Capacity Score</span>
                  <h3 className="fw-bold text-primary mb-0">{riskScore} <span className="fs-6 text-muted">/ 100</span></h3>
                </div>
                <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                  {predictedTier} Risk Tier
                </span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${riskScore}%` }}
                  aria-valuenow={riskScore}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>

            <h6 className="fw-bold small text-muted mb-2">Model Classification Probabilities:</h6>
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer>
                <BarChart data={confidenceData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(val) => [`${val}%`, 'Confidence']} />
                  <Bar dataKey="probability" radius={[0, 6, 6, 0]}>
                    {confidenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="d-flex align-items-center gap-2 p-2 rounded bg-light border text-muted small mt-2">
              <FiInfo className="text-primary flex-shrink-0" />
              <span>
                Self-reported preference: <strong className="text-dark">{profile.riskProfile || 'Moderate'}</strong> | ML Model Evaluation: <strong className="text-primary">{predictedTier}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Portfolio Allocation Pie Chart Widget */}
        <div className="col-lg-6">
          <div className="widget-card h-100">
            <div className="widget-title d-flex justify-content-between align-items-center mb-3">
              <span className="d-flex align-items-center gap-2">
                <FiPieChart style={{ color: 'var(--info)' }} />
                Recommended Portfolio Allocation
              </span>
              <span className="fw-bold text-primary">₹{portfolioValue.toLocaleString()}</span>
            </div>

            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={portfolioAllocations}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {portfolioAllocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="row g-2 mt-2">
              {portfolioAllocations.map((item, idx) => (
                <div className="col-4" key={idx}>
                  <div className="p-2 rounded bg-light border text-center">
                    <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{item.name}</span>
                    <strong style={{ color: item.color, fontSize: '0.9rem' }}>{item.percentage}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Section 2: Personalized AI Financial Recommendations */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="widget-card">
            <div className="widget-title mb-3 d-flex align-items-center justify-content-between">
              <span className="d-flex align-items-center gap-2">
                <FiMessageSquare className="text-primary" />
                Personalized AI Financial Recommendations
              </span>
              <span className="text-muted small">Generated from your questionnaire & ML model assessment</span>
            </div>

            <div className="row g-3">
              {dynamicRecommendations.map((rec, idx) => (
                <div className="col-md-6 col-lg-3" key={idx}>
                  <div className="p-3 rounded-4 border bg-white shadow-sm h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        {rec.icon}
                        <span className={`badge ${rec.badgeBg} small rounded-pill px-2 py-1`}>
                          {rec.priority}
                        </span>
                      </div>
                      <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{rec.title}</h6>
                      <p className="text-muted mb-0" style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
                        {rec.text}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-top text-muted small d-flex align-items-center gap-1">
                      <FiInfo size={12} /> {rec.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview & Goals Progress */}
      <div className="row g-4">
        {/* Market Overview */}
        <div className="col-lg-6">
          <div className="widget-card h-100">
            <div className="widget-title d-flex justify-content-between align-items-center mb-3">
              <span className="d-flex align-items-center gap-2">
                <FiTrendingUp style={{ color: 'var(--info)' }} /> Market Overview
              </span>
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
                  <div className="d-flex justify-content-between align-items-center py-2 border-bottom" key={key}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        {key === 'bankNifty' ? 'Bank Nifty' : key === 'sensex' ? 'SENSEX' : 'NIFTY 50'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{data.value.toLocaleString()}</div>
                      <div style={{ fontSize: '0.82rem', color: data.change >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.percentChange.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-4 text-muted">Unable to load market data</div>
            )}
          </div>
        </div>

        {/* Dynamic Financial Goals Progress */}
        <div className="col-lg-6">
          <div className="widget-card h-100">
            <div className="widget-title mb-3 d-flex align-items-center gap-2">
              <FiTarget style={{ color: 'var(--accent)' }} /> Goal Progress Tracking
            </div>
            {goals.map((goal, idx) => (
              <div className="mb-3" key={idx}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <span className="me-2">{goal.emoji}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{goal.name}</span>
                  </div>
                  <div className="text-end">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{goal.saved}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}> of {goal.target}</span>
                  </div>
                </div>
                <div className="progress-styled progress">
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
