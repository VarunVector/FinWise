import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FinancialDataContext = createContext(null);

const DEFAULT_HOLDINGS = [
  {
    id: 'h1',
    name: 'Flexi Cap Growth Fund (sample)',
    subtitle: 'Flexi Cap · Demo',
    category: 'Mutual Funds',
    assetClass: 'Equity',
    risk: 'Moderate',
    invested: 300000,
    value: 352000,
    units: 4250.5,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  },
  {
    id: 'h2',
    name: 'Large Cap Index Fund (sample)',
    subtitle: 'Index Fund · Demo',
    category: 'Mutual Funds',
    assetClass: 'Equity',
    risk: 'Moderate',
    invested: 250000,
    value: 284000,
    units: 1850.2,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  },
  {
    id: 'h3',
    name: 'Liquid Debt Fund (sample)',
    subtitle: 'Liquid · Demo',
    category: 'Mutual Funds',
    assetClass: 'Debt',
    risk: 'Low',
    invested: 175000,
    value: 187500,
    units: 1200.0,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  },
  {
    id: 'h4',
    name: 'Small Cap Fund (sample)',
    subtitle: 'Small Cap · Demo',
    category: 'Mutual Funds',
    assetClass: 'Equity',
    risk: 'Very High',
    invested: 150000,
    value: 171000,
    units: 950.8,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  },
  {
    id: 'h5',
    name: 'Bank FD - 3Y (sample)',
    subtitle: 'Bank FD · 7.1% p.a. to 28 Nov 2028 · Demo',
    category: 'Fixed Deposits',
    assetClass: 'Debt',
    risk: 'Very Low',
    invested: 150000,
    value: 160070,
    rate: 7.1,
    maturityDate: '28 Nov 2028',
    valuedDate: 'Accrual estimate',
    isAccrual: true,
    tag: 'Demo'
  },
  {
    id: 'h6',
    name: 'Sample Tech Services',
    subtitle: 'IT · 40 units · Demo',
    category: 'Stocks',
    assetClass: 'Equity',
    risk: 'High',
    invested: 130000,
    value: 144300,
    units: 40,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  },
  {
    id: 'h7',
    name: 'Sample Energy Corp',
    subtitle: 'Energy · 60 units · Demo',
    category: 'Stocks',
    assetClass: 'Equity',
    risk: 'High',
    invested: 120000,
    value: 118200,
    units: 60,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  },
  {
    id: 'h8',
    name: 'Sample Bank Ltd',
    subtitle: 'Banking · 100 units · Demo',
    category: 'Stocks',
    assetClass: 'Equity',
    risk: 'Moderate',
    invested: 100000,
    value: 108500,
    units: 100,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  },
  {
    id: 'h9',
    name: 'Bank FD - 1Y (sample)',
    subtitle: 'Bank FD · 6.8% p.a. to 28 May 2027 · Demo',
    category: 'Fixed Deposits',
    assetClass: 'Debt',
    risk: 'Very Low',
    invested: 100000,
    value: 102924,
    rate: 6.8,
    maturityDate: '28 May 2027',
    valuedDate: 'Accrual estimate',
    isAccrual: true,
    tag: 'Demo'
  },
  {
    id: 'h10',
    name: 'Sovereign Gold Bond (sample)',
    subtitle: 'Sovereign Gold Bond · Demo',
    category: 'Gold',
    assetClass: 'Gold',
    risk: 'Low',
    invested: 80000,
    value: 94000,
    units: 15,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  },
  {
    id: 'h11',
    name: 'Nifty 50 ETF (sample)',
    subtitle: 'Index ETF · 450 units · Demo',
    category: 'ETFs',
    assetClass: 'Equity',
    risk: 'Moderate',
    invested: 75000,
    value: 80500,
    units: 450,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  },
  {
    id: 'h12',
    name: 'Gold BeES ETF (sample)',
    subtitle: 'Gold ETF · 700 units · Demo',
    category: 'ETFs',
    assetClass: 'Gold',
    risk: 'Low',
    invested: 50000,
    value: 44800,
    units: 700,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  },
  {
    id: 'h13',
    name: 'Physical 24K Gold Bar (sample)',
    subtitle: 'Bullion · Demo',
    category: 'Gold',
    assetClass: 'Gold',
    risk: 'Low',
    invested: 45000,
    value: 44500,
    units: 6,
    valuedDate: '28 Oct 2026',
    isAccrual: false,
    tag: 'Demo'
  }
];

const DEFAULT_GOALS = [
  {
    id: 'g1',
    name: 'Emergency Fund',
    category: 'Emergency Fund',
    targetAmount: 312000,
    savedAmount: 240000,
    monthlyContribution: 9000,
    targetDate: '2027-06-28',
    targetDateLabel: '28 Jun 2027',
    monthsLeft: 8,
    priority: 'High',
    status: 'On track',
    neededZeroReturn: 9000
  },
  {
    id: 'g2',
    name: 'Higher Education',
    category: 'Higher Education',
    targetAmount: 2500000,
    savedAmount: 400000,
    monthlyContribution: 18000,
    targetDate: '2031-10-28',
    targetDateLabel: '28 Oct 2031',
    monthsLeft: 60,
    priority: 'High',
    status: 'Behind',
    neededZeroReturn: 35000
  },
  {
    id: 'g3',
    name: 'Buy a Dream Home',
    category: 'Home Purchase',
    targetAmount: 25000000,
    savedAmount: 1200000,
    monthlyContribution: 25000,
    targetDate: '2036-10-28',
    targetDateLabel: '28 Oct 2036',
    monthsLeft: 120,
    priority: 'High',
    status: 'Behind',
    neededZeroReturn: 120000
  },
  {
    id: 'g4',
    name: 'Retirement Corpus',
    category: 'Retirement',
    targetAmount: 8000000,
    savedAmount: 300000,
    monthlyContribution: 15000,
    targetDate: '2046-10-28',
    targetDateLabel: '28 Oct 2046',
    monthsLeft: 240,
    priority: 'Medium',
    status: 'Behind',
    neededZeroReturn: 30000
  },
  {
    id: 'g5',
    name: 'Vacation Fund',
    category: 'Travel & Lifestyle',
    targetAmount: 200000,
    savedAmount: 60000,
    monthlyContribution: 5000,
    targetDate: '2027-12-28',
    targetDateLabel: '28 Dec 2027',
    monthsLeft: 14,
    priority: 'Low',
    status: 'Behind',
    neededZeroReturn: 10000
  },
  {
    id: 'g6',
    name: 'Car Upgrade',
    category: 'Vehicle',
    targetAmount: 1000000,
    savedAmount: 0,
    monthlyContribution: 2000,
    targetDate: '2029-10-28',
    targetDateLabel: '28 Oct 2029',
    monthsLeft: 36,
    priority: 'Low',
    status: 'Behind',
    neededZeroReturn: 28000
  }
];

const DEFAULT_PROFILE = {
  monthlyIncome: 95000,
  monthlyExpenses: 52000,
  sipBudget: 25000,
  emergencyFundMonths: 6,
  riskProfile: 'moderate',
  riskScore: 54.0,
  riskTier: 'Moderate',
  investmentHorizonYears: 12,
  assumedReturnRate: 11.5,
  targetEquity: 55,
  targetDebt: 33,
  targetGold: 12
};

const DEFAULT_TRANSACTIONS = [
  { id: 'TXN001', type: 'credit', category: 'Salary', amount: 95000, date: '2026-10-28', description: 'Monthly Salary Credit', status: 'completed' },
  { id: 'TXN002', type: 'debit', category: 'SIP Investment', amount: 25000, date: '2026-10-25', description: 'Auto-Debit: Flexi Cap & Index SIP', status: 'completed' },
  { id: 'TXN003', type: 'debit', category: 'Shopping', amount: 3500, date: '2026-10-24', description: 'Amazon India Electronics', status: 'completed' },
  { id: 'TXN004', type: 'debit', category: 'Dining', amount: 1200, date: '2026-10-23', description: 'Weekend Dinner', status: 'completed' },
  { id: 'TXN005', type: 'credit', category: 'Freelance', amount: 15000, date: '2026-10-22', description: 'Consulting Honorarium', status: 'completed' },
  { id: 'TXN006', type: 'debit', category: 'EMI Payment', amount: 18500, date: '2026-10-20', description: 'Home Loan EMI', status: 'completed' },
  { id: 'TXN007', type: 'debit', category: 'Utilities', amount: 4200, date: '2026-10-18', description: 'Electricity & High-speed Broadband', status: 'completed' },
  { id: 'TXN008', type: 'credit', category: 'Dividend', amount: 3200, date: '2026-10-15', description: 'Sample Tech Services Interim Dividend', status: 'completed' },
];

export const FinancialDataProvider = ({ children }) => {
  const { user } = useAuth();

  // Load initial state from localStorage or defaults
  const [holdings, setHoldings] = useState(() => {
    try {
      const stored = localStorage.getItem('finwise_holdings');
      return stored ? JSON.parse(stored) : DEFAULT_HOLDINGS;
    } catch {
      return DEFAULT_HOLDINGS;
    }
  });

  const [goals, setGoals] = useState(() => {
    try {
      const stored = localStorage.getItem('finwise_goals');
      return stored ? JSON.parse(stored) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem('finwise_transactions');
      return stored ? JSON.parse(stored) : DEFAULT_TRANSACTIONS;
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  });

  const [financialProfile, setFinancialProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('finwise_financial_profile');
      if (stored) return JSON.parse(stored);

      // Check if user has profile from onboarding
      const userProfile = user?.profile || {};
      return {
        ...DEFAULT_PROFILE,
        monthlyIncome: userProfile.monthlyIncome || DEFAULT_PROFILE.monthlyIncome,
        monthlyExpenses: userProfile.monthlyExpenses || DEFAULT_PROFILE.monthlyExpenses,
        riskProfile: userProfile.riskProfile || DEFAULT_PROFILE.riskProfile,
      };
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('finwise_holdings', JSON.stringify(holdings));
    } catch (e) {
      console.warn('Failed to persist holdings:', e);
    }
  }, [holdings]);

  useEffect(() => {
    try {
      localStorage.setItem('finwise_goals', JSON.stringify(goals));
    } catch (e) {
      console.warn('Failed to persist goals:', e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem('finwise_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn('Failed to persist transactions:', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('finwise_financial_profile', JSON.stringify(financialProfile));
    } catch (e) {
      console.warn('Failed to persist financial profile:', e);
    }
  }, [financialProfile]);

  // Dynamic Portfolio Metrics Calculation
  const metrics = useMemo(() => {
    const portfolioValue = holdings.reduce((sum, h) => sum + (Number(h.value) || 0), 0);
    const investedPrincipal = holdings.reduce((sum, h) => sum + (Number(h.invested) || 0), 0);
    const absoluteReturn = portfolioValue - investedPrincipal;
    const returnPercentage = investedPrincipal > 0 ? (absoluteReturn / investedPrincipal) * 100 : 0;

    const monthlyIncome = Number(financialProfile.monthlyIncome) || 0;
    const monthlyExpenses = Number(financialProfile.monthlyExpenses) || 0;
    const monthlySurplus = Math.max(0, monthlyIncome - monthlyExpenses);
    const savingsRate = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) * 100 : 0;
    const sipBudget = Number(financialProfile.sipBudget) || 25000;

    // Breakdown by Category
    const categoryTotals = {
      'Mutual Funds': 0,
      'Stocks': 0,
      'ETFs': 0,
      'Gold': 0,
      'Fixed Deposits': 0,
    };

    holdings.forEach((h) => {
      const cat = h.category || 'Other';
      if (categoryTotals[cat] !== undefined) {
        categoryTotals[cat] += Number(h.value) || 0;
      } else {
        categoryTotals[cat] = Number(h.value) || 0;
      }
    });

    const categoryBreakdown = Object.entries(categoryTotals).map(([name, val]) => ({
      name,
      value: val,
      percentage: portfolioValue > 0 ? (val / portfolioValue) * 100 : 0,
    }));

    // Breakdown by Asset Class (Equity, Debt, Gold)
    const assetClassTotals = {
      Equity: 0,
      Debt: 0,
      Gold: 0,
    };

    holdings.forEach((h) => {
      const ac = h.assetClass || 'Equity';
      if (assetClassTotals[ac] !== undefined) {
        assetClassTotals[ac] += Number(h.value) || 0;
      } else {
        assetClassTotals[ac] = Number(h.value) || 0;
      }
    });

    const assetClassBreakdown = Object.entries(assetClassTotals).map(([name, val]) => ({
      name,
      value: val,
      percentage: portfolioValue > 0 ? (val / portfolioValue) * 100 : 0,
    }));

    // Goal Metrics
    const totalGoalTarget = goals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
    const totalGoalSaved = goals.reduce((sum, g) => sum + (Number(g.savedAmount) || 0), 0);
    const totalMonthlyContributions = goals.reduce((sum, g) => sum + (Number(g.monthlyContribution) || 0), 0);
    const totalNeededMonthly = goals.reduce((sum, g) => sum + (Number(g.neededZeroReturn) || 0), 0);
    const isOverSurplus = totalMonthlyContributions > monthlySurplus;

    return {
      portfolioValue,
      investedPrincipal,
      absoluteReturn,
      returnPercentage,
      holdingsCount: holdings.length,
      monthlyIncome,
      monthlyExpenses,
      monthlySurplus,
      savingsRate,
      sipBudget,
      categoryTotals,
      categoryBreakdown,
      assetClassTotals,
      assetClassBreakdown,
      totalGoalTarget,
      totalGoalSaved,
      totalMonthlyContributions,
      totalNeededMonthly,
      isOverSurplus,
    };
  }, [holdings, goals, financialProfile]);

  // Actions
  const addHolding = useCallback((newHolding) => {
    setHoldings((prev) => [
      ...prev,
      {
        id: `h_${Date.now()}`,
        tag: 'User added',
        valuedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        ...newHolding,
        invested: Number(newHolding.invested) || 0,
        value: Number(newHolding.value) || 0,
      }
    ]);
  }, []);

  const updateHolding = useCallback((id, updated) => {
    setHoldings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updated } : h))
    );
  }, []);

  const deleteHolding = useCallback((id) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const addGoal = useCallback((newGoal) => {
    const months = Number(newGoal.monthsLeft) || 12;
    const needed = (Number(newGoal.targetAmount) - Number(newGoal.savedAmount || 0)) / months;

    setGoals((prev) => [
      ...prev,
      {
        id: `g_${Date.now()}`,
        neededZeroReturn: Math.max(0, Math.round(needed)),
        status: (Number(newGoal.monthlyContribution) >= needed) ? 'On track' : 'Behind',
        ...newGoal,
        targetAmount: Number(newGoal.targetAmount) || 0,
        savedAmount: Number(newGoal.savedAmount) || 0,
        monthlyContribution: Number(newGoal.monthlyContribution) || 0,
      }
    ]);
  }, []);

  const updateGoal = useCallback((id, updated) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const merged = { ...g, ...updated };
        const months = Number(merged.monthsLeft) || 12;
        const needed = (Number(merged.targetAmount) - Number(merged.savedAmount || 0)) / months;
        merged.neededZeroReturn = Math.max(0, Math.round(needed));
        merged.status = (Number(merged.monthlyContribution) >= merged.neededZeroReturn) ? 'On track' : 'Behind';
        return merged;
      })
    );
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // Rebalance goal contributions within SIP budget / monthly surplus
  const applyRecommendedContributions = useCallback(() => {
    const budgetCap = Math.min(financialProfile.sipBudget || 25000, metrics.monthlySurplus || 43000);

    setGoals((prev) => {
      // Sort priority High -> Medium -> Low, then by monthsLeft
      const priorityWeights = { High: 3, Medium: 2, Low: 1 };
      const sorted = [...prev].sort((a, b) => {
        const pDiff = (priorityWeights[b.priority] || 1) - (priorityWeights[a.priority] || 1);
        if (pDiff !== 0) return pDiff;
        return (a.monthsLeft || 999) - (b.monthsLeft || 999);
      });

      let remainingBudget = budgetCap;
      const rebalanced = sorted.map((g) => {
        const needed = g.neededZeroReturn || 5000;
        let assigned = 0;
        if (remainingBudget > 0) {
          if (remainingBudget >= needed) {
            assigned = needed;
            remainingBudget -= needed;
          } else {
            assigned = remainingBudget;
            remainingBudget = 0;
          }
        }
        return {
          ...g,
          monthlyContribution: assigned,
          status: assigned >= needed ? 'On track' : 'Behind'
        };
      });

      // Restore original order
      const idMap = new Map(rebalanced.map((item) => [item.id, item]));
      return prev.map((g) => idMap.get(g.id) || g);
    });
  }, [financialProfile.sipBudget, metrics.monthlySurplus]);

  const addTransaction = useCallback((newTxn) => {
    const txn = {
      id: `TXN${String(Date.now()).slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      ...newTxn,
      amount: Number(newTxn.amount) || 0,
    };
    setTransactions((prev) => [txn, ...prev]);

    // Update income or expenses if applicable
    if (txn.type === 'credit' && txn.category === 'Salary') {
      setFinancialProfile((p) => ({ ...p, monthlyIncome: txn.amount }));
    }
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateFinancialProfile = useCallback((updates) => {
    setFinancialProfile((prev) => ({
      ...prev,
      ...updates,
      monthlyIncome: updates.monthlyIncome !== undefined ? Number(updates.monthlyIncome) : prev.monthlyIncome,
      monthlyExpenses: updates.monthlyExpenses !== undefined ? Number(updates.monthlyExpenses) : prev.monthlyExpenses,
      sipBudget: updates.sipBudget !== undefined ? Number(updates.sipBudget) : prev.sipBudget,
    }));
  }, []);

  const resetToDemoData = useCallback(() => {
    setHoldings(DEFAULT_HOLDINGS);
    setGoals(DEFAULT_GOALS);
    setTransactions(DEFAULT_TRANSACTIONS);
    setFinancialProfile(DEFAULT_PROFILE);
    localStorage.removeItem('finwise_holdings');
    localStorage.removeItem('finwise_goals');
    localStorage.removeItem('finwise_transactions');
    localStorage.removeItem('finwise_financial_profile');
  }, []);

  return (
    <FinancialDataContext.Provider
      value={{
        holdings,
        goals,
        transactions,
        financialProfile,
        metrics,
        addHolding,
        updateHolding,
        deleteHolding,
        addGoal,
        updateGoal,
        deleteGoal,
        applyRecommendedContributions,
        addTransaction,
        deleteTransaction,
        updateFinancialProfile,
        resetToDemoData,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
};

export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
};

