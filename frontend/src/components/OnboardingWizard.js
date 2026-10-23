import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiCheck, FiArrowRight, FiArrowLeft, FiShield } from 'react-icons/fi';
import {
  BiHappy, BiTargetLock, BiWallet, BiBarChartAlt2
} from 'react-icons/bi';

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    goals: [],
    otherGoal: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    riskProfile: null,
    age: '',
    occupation: '',
    financialSituation: '',
    emergencyFund: '',
    monthlySavingsRate: '',
    loansStatus: '',
    incomeLossRunway: '',
    investmentExperience: '',
    investmentKnowledge: '',
    preInvestingHabit: '',
    marketReaction: '',
    investmentHorizon: '',
    riskStatement: '',
    moneyUsageTimeline: '',
    interestedAssets: [],
    monthlyInvestmentAmount: '',
    importantFactor: '',
    portfolioReviewFrequency: '',
    recommendationTypes: [],
  });

  const totalSteps = 6;

  const goals = [
    { id: 'retirement', label: 'Retirement Planning', icon: '🏖️', desc: 'Build corpus for retirement' },
    { id: 'emergency', label: 'Emergency Fund', icon: '🛡️', desc: '6 months of expenses saved' },
    { id: 'wealth', label: 'Wealth Building', icon: '📈', desc: 'Grow your net worth' },
    { id: 'education', label: 'Children Education', icon: '🎓', desc: 'Plan for higher education' },
    { id: 'house', label: 'Buy a Home', icon: '🏠', desc: 'Save for down payment' },
    { id: 'travel', label: 'Travel & Lifestyle', icon: '✈️', desc: 'Fund your dream vacation' },
    { id: 'tax', label: 'Tax Saving', icon: '💰', desc: 'Optimize tax investments' },
    { id: 'sidehustle', label: 'Side Business', icon: '🚀', desc: 'Start a side venture' },
    { id: 'other', label: 'Other', icon: '📝', desc: 'Specify your own goal' },
  ];

  const riskProfiles = [
    { id: 'conservative', label: 'Conservative', icon: '🛡️', desc: 'Low risk, stable returns', color: '#2ECC71', range: '5-8%' },
    { id: 'moderate', label: 'Moderate', icon: '⚖️', desc: 'Balanced risk & returns', color: '#F39C12', range: '8-12%' },
    { id: 'aggressive', label: 'Aggressive', icon: '🚀', desc: 'High risk, high returns', color: '#E74C3C', range: '12-18%' },
  ];

  const profileQuestions = [
    { key: 'age', section: 'Personal profile', label: 'What is your age?', type: 'single', options: ['Below 18', '18–25', '26–35', '36–50', 'Above 50'] },
    { key: 'occupation', section: 'Personal profile', label: 'What best describes your occupation?', type: 'single', options: ['Student', 'Salaried', 'Self-Employed', 'Business Owner', 'Retired', 'Other'] },
    { key: 'financialSituation', section: 'Personal profile', label: 'Which statement best describes your current financial situation?', type: 'single', options: ["I'm just getting started.", 'I save regularly.', 'I already invest.', 'I actively manage my wealth.'] },
    { key: 'emergencyFund', section: 'Financial health', label: 'Do you have an emergency fund?', type: 'single', options: ['No', 'Less than 3 months', '3–6 months', 'More than 6 months'] },
    { key: 'monthlySavingsRate', section: 'Financial health', label: 'What percentage of your income do you save every month?', type: 'single', options: ['Less than 10%', '10–20%', '20–40%', 'Above 40%'] },
    { key: 'loansStatus', section: 'Financial health', label: 'Do you currently have any loans or EMIs?', type: 'single', options: ['No', 'Yes, manageable', 'Yes, high burden'] },
    { key: 'incomeLossRunway', section: 'Financial health', label: 'If you suddenly lose your income, how long can you manage your expenses?', type: 'single', options: ['Less than 1 month', '1–3 months', '3–6 months', 'More than 6 months'] },
    { key: 'investmentExperience', section: 'Investment experience', label: 'Have you invested before?', type: 'single', options: ['Never', 'Gold', 'Mutual Funds', 'Stocks', 'Multiple Assets'] },
    { key: 'investmentKnowledge', section: 'Investment experience', label: 'How would you rate your investment knowledge?', type: 'single', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'preInvestingHabit', section: 'Investment experience', label: 'Before investing, what do you usually do?', type: 'single', options: ['Invest immediately', 'Ask friends or family', 'Research online', 'Compare multiple sources'] },
    { key: 'marketReaction', section: 'Risk assessment', label: 'If your investment loses 20% in one month, what would you do?', type: 'single', options: ['Sell Everything', 'Sell Some', 'Hold', 'Buy More'] },
    { key: 'investmentHorizon', section: 'Risk assessment', label: 'How long can you stay invested without withdrawing money?', type: 'single', options: ['Less than 1 year', '1–3 years', '3–5 years', 'More than 5 years'] },
    { key: 'riskStatement', section: 'Risk assessment', label: 'Which statement describes you best?', type: 'single', options: ['Safety is my priority.', 'I prefer balanced growth.', 'I can take moderate risk.', 'I seek maximum returns.'] },
    { key: 'moneyUsageTimeline', section: 'Risk assessment', label: 'When do you expect to use this money?', type: 'single', options: ['Within 1 year', '1–3 years', '3–7 years', 'More than 7 years'] },
    { key: 'interestedAssets', section: 'Investment preferences', label: 'Which assets are you interested in? (Multiple Select)', type: 'multi', options: ['Mutual Funds', 'Stocks', 'Gold', 'ETFs', 'Bonds', 'Fixed Deposits'] },
    { key: 'monthlyInvestmentAmount', section: 'Investment preferences', label: 'How much would you like to invest every month?', type: 'single', options: ['Below ₹1,000', '₹1k–₹5k', '₹5k–₹10k', '₹10k–₹25k', 'Above ₹25k'] },
    { key: 'importantFactor', section: 'Investment preferences', label: 'Which factor is most important while investing?', type: 'single', options: ['Safety', 'Returns', 'Liquidity', 'Tax Saving'] },
    { key: 'portfolioReviewFrequency', section: 'Investment preferences', label: 'How often should AI review your portfolio?', type: 'single', options: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'] },
    { key: 'recommendationTypes', section: 'AI personalization', label: 'What type of recommendations do you want? (Multiple Select)', type: 'multi', options: ['Mutual Funds', 'Stocks', 'Gold', 'Complete Portfolio', 'Goal-Based Investment'] },
  ];

  const selectSingleAnswer = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleMultiAnswer = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value],
    }));
  };

  const toggleGoal = (goalId) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleNext = () => {
    if (currentStep === 4) {
      const currentQuestion = profileQuestions[questionIndex];
      const currentValue = formData[currentQuestion.key];
      const currentQuestionValid = currentQuestion.type === 'multi'
        ? currentValue.length > 0
        : Boolean(currentValue);

      if (!currentQuestionValid) {
        return;
      }

      if (questionIndex < profileQuestions.length - 1) {
        setQuestionIndex(prev => prev + 1);
        return;
      }

      setCurrentStep(prev => prev + 1);
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 4 && questionIndex > 0) {
      setQuestionIndex(prev => prev - 1);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const mapOnboardingToRiskModelInput = (data) => {
    const efMap = { 'No': 1, 'Less than 3 months': 2, '3–6 months': 5, 'More than 6 months': 8 };
    const ilrMap = { 'Less than 1 month': 1, '1–3 months': 2, '3–6 months': 3, 'More than 6 months': 4 };
    const expMap = { 'Never': 1, 'Gold': 1, 'Mutual Funds': 2, 'Stocks': 3, 'Multiple Assets': 3 };
    const ikMap = { 'Beginner': 2, 'Intermediate': 4, 'Advanced': 6 };
    const msrMap = { 'Less than 10%': 2, '10–20%': 4, '20–40%': 6, 'Above 40%': 8 };
    const occMap = { 'Student': 1, 'Salaried': 3, 'Self-Employed': 2, 'Business Owner': 3, 'Retired': 2, 'Other': 2 };
    const loanMap = { 'No': 1, 'Yes, manageable': 3, 'Yes, high burden': 6 };

    return {
      emergencySavings: efMap[data.emergencyFund] || 4,
      emergencyConfidence: ilrMap[data.incomeLossRunway] || 3,
      stocksBonds: expMap[data.investmentExperience] || 2,
      investmentChoice: ikMap[data.investmentKnowledge] || 4,
      financialKnowledge: ikMap[data.investmentKnowledge] || 4,
      householdIncome: msrMap[data.monthlySavingsRate] || 5,
      incomeStability: occMap[data.occupation] || 3,
      spendingVsIncome: 2,
      tooMuchDebt: loanMap[data.loansStatus] || 3,
      creditCardLateFee: data.loansStatus === 'Yes, high burden' ? 2 : 1,
      medicalDebt: 1,
    };
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const goalsPayload = formData.goals.includes('other')
        ? [...formData.goals.filter(g => g !== 'other'), `other: ${formData.otherGoal}`]
        : formData.goals;

      // 🤖 Call Python ML Model API with mapped questionnaire inputs
      let riskModelOutput = null;
      try {
        const modelPayload = mapOnboardingToRiskModelInput(formData);
        const questionnaireAnswers = {
          age: formData.age,
          occupation: formData.occupation,
          financialSituation: formData.financialSituation,
          emergencyFund: formData.emergencyFund,
          monthlySavingsRate: formData.monthlySavingsRate,
          loansStatus: formData.loansStatus,
          incomeLossRunway: formData.incomeLossRunway,
          investmentExperience: formData.investmentExperience,
          investmentKnowledge: formData.investmentKnowledge,
          preInvestingHabit: formData.preInvestingHabit,
          marketReaction: formData.marketReaction,
          investmentHorizon: formData.investmentHorizon,
          riskStatement: formData.riskStatement,
          moneyUsageTimeline: formData.moneyUsageTimeline,
          interestedAssets: formData.interestedAssets,
          monthlyInvestmentAmount: formData.monthlyInvestmentAmount,
          importantFactor: formData.importantFactor,
          portfolioReviewFrequency: formData.portfolioReviewFrequency,
          recommendationTypes: formData.recommendationTypes,
          goals: goalsPayload,
          monthlyIncome: formData.monthlyIncome,
          monthlyExpenses: formData.monthlyExpenses,
        };

        const res = await fetch('http://localhost:5000/api/risk/assess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userInfo: {
              email: user?.email || 'demo@finwise.ai',
              name: formData.name || user?.name || 'User',
              user_id: user?.id || ''
            },
            questionnaire: questionnaireAnswers,
            modelInput: modelPayload,
            ...modelPayload
          }),
        });
        const apiRes = await res.json();
        if (apiRes.success) {
          riskModelOutput = apiRes.data;
          try {
            localStorage.setItem('finwise_latest_risk', JSON.stringify(riskModelOutput));
          } catch (e) { }
        }
      } catch (err) {
        console.warn('[Onboarding] Could not connect to Python Flask API. Using fallback profile risk assessment.', err);
      }

      const profilePayload = {
        name: formData.name,
        goals: goalsPayload,
        otherGoal: formData.otherGoal,
        monthlyIncome: parseInt(formData.monthlyIncome) || 0,
        monthlyExpenses: parseInt(formData.monthlyExpenses) || 0,
        riskProfile: riskModelOutput ? riskModelOutput.risk_tier.toLowerCase() : (formData.riskProfile || 'moderate'),
        riskModelOutput: riskModelOutput,
        questionnaire: {
          age: formData.age,
          occupation: formData.occupation,
          financialSituation: formData.financialSituation,
          emergencyFund: formData.emergencyFund,
          monthlySavingsRate: formData.monthlySavingsRate,
          loansStatus: formData.loansStatus,
          incomeLossRunway: formData.incomeLossRunway,
          investmentExperience: formData.investmentExperience,
          investmentKnowledge: formData.investmentKnowledge,
          preInvestingHabit: formData.preInvestingHabit,
          marketReaction: formData.marketReaction,
          investmentHorizon: formData.investmentHorizon,
          riskStatement: formData.riskStatement,
          moneyUsageTimeline: formData.moneyUsageTimeline,
          interestedAssets: formData.interestedAssets,
          monthlyInvestmentAmount: formData.monthlyInvestmentAmount,
          importantFactor: formData.importantFactor,
          portfolioReviewFrequency: formData.portfolioReviewFrequency,
          recommendationTypes: formData.recommendationTypes,
        },
        // Set portfolio data aligned with ML model allocation
        totalInvestments: 250000,
        totalReturns: 37500,
        portfolioValue: 287500,
        sipAmount: 15000,
        fdAmount: riskModelOutput ? (riskModelOutput.allocations.find(a => a.category.includes('Cash') || a.category.includes('Deposit'))?.percentage || 25) * 2875 : 100000,
        equityAmount: riskModelOutput ? (riskModelOutput.allocations.find(a => a.category.includes('Equit'))?.percentage || 50) * 2875 : 150000,
      };

      try {
        localStorage.setItem('finwise_user_profile', JSON.stringify(profilePayload));
        if (user?.id) localStorage.setItem(`finwise_user_profile_${user.id}`, JSON.stringify(profilePayload));
        if (user?.email) localStorage.setItem(`finwise_user_profile_${user.email}`, JSON.stringify(profilePayload));
      } catch (e) { }

      const result = await completeOnboarding(profilePayload);

      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.name.trim().length > 0;
      case 1: return formData.goals.length > 0 && (!formData.goals.includes('other') || formData.otherGoal.trim().length > 0);
      case 2: return formData.monthlyIncome > 0 && formData.monthlyExpenses > 0;
      case 3: return formData.riskProfile !== null;
      case 4: {
        const currentQuestion = profileQuestions[questionIndex];
        const currentValue = formData[currentQuestion.key];
        return currentQuestion.type === 'multi' ? currentValue.length > 0 : Boolean(currentValue);
      }
      case 5: return true;
      default: return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="progress-indicator">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`progress-step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
        >
          {i < currentStep ? <FiCheck /> : i + 1}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <div className="feature-icon mx-auto mb-4" style={{ background: 'rgba(0,168,107,0.1)', color: 'var(--primary)', width: '80px', height: '80px', fontSize: '2.5rem', borderRadius: '50%' }}>
              <BiHappy />
            </div>
            <h4 className="fw-bold mb-3">Welcome to FinWise AI!</h4>
            <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
              Let's get to know you better so we can provide personalized financial advice tailored to your needs.
            </p>
            <div className="form-floating mb-3" style={{ maxWidth: '400px', margin: '0 auto' }}>
              <input
                type="text"
                className="form-control"
                id="nameInput"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <label htmlFor="nameInput">Your Full Name</label>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <div className="text-center mb-4">
              <div className="feature-icon mx-auto mb-3" style={{ background: 'rgba(0,168,107,0.1)', color: 'var(--primary)', width: '80px', height: '80px', fontSize: '2.5rem', borderRadius: '50%' }}>
                <BiTargetLock />
              </div>
              <h4 className="fw-bold mb-2">What are your financial goals?</h4>
              <p className="text-muted">Select all that apply to you</p>
            </div>
            <div className="row g-2">
              {goals.map(goal => (
                <div className="col-6 col-md-4" key={goal.id}>
                  <div
                    className={`goal-card p-3 rounded-3 border text-center cursor-pointer ${formData.goals.includes(goal.id) ? 'border-success bg-success bg-opacity-10' : 'border-light'}`}
                    onClick={() => toggleGoal(goal.id)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s', height: '100%' }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{goal.icon}</div>
                    <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{goal.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{goal.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {formData.goals.includes('other') && (
              <div className="mt-3" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="otherGoalInput"
                    placeholder="Describe your goal"
                    value={formData.otherGoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherGoal: e.target.value }))}
                  />
                  <label htmlFor="otherGoalInput">Describe your financial goal</label>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <div className="text-center mb-4">
              <div className="feature-icon mx-auto mb-3" style={{ background: 'rgba(0,168,107,0.1)', color: 'var(--primary)', width: '80px', height: '80px', fontSize: '2.5rem', borderRadius: '50%' }}>
                <BiWallet />
              </div>
              <h4 className="fw-bold mb-2">Tell us about your finances</h4>
              <p className="text-muted">This helps us create a personalized budget plan</p>
            </div>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="incomeInput"
                  placeholder="Monthly Income"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                />
                <label htmlFor="incomeInput">Monthly Income (₹)</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="number"
                  className="form-control"
                  id="expenseInput"
                  placeholder="Monthly Expenses"
                  value={formData.monthlyExpenses}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyExpenses: e.target.value }))}
                />
                <label htmlFor="expenseInput">Monthly Expenses (₹)</label>
              </div>
              {formData.monthlyIncome > 0 && formData.monthlyExpenses > 0 && (
                <div className={`alert ${parseInt(formData.monthlyIncome) > parseInt(formData.monthlyExpenses) ? 'alert-success' : 'alert-warning'} mt-3`}>
                  {parseInt(formData.monthlyIncome) > parseInt(formData.monthlyExpenses)
                    ? `👍 You save ₹${(parseInt(formData.monthlyIncome) - parseInt(formData.monthlyExpenses)).toLocaleString()} per month!`
                    : '⚠️ Your expenses exceed income. Let us help you optimize!'}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="text-center mb-4">
              <div className="feature-icon mx-auto mb-3" style={{ background: 'rgba(0,168,107,0.1)', color: 'var(--primary)', width: '80px', height: '80px', fontSize: '2.5rem', borderRadius: '50%' }}>
                <BiBarChartAlt2 />
              </div>
              <h4 className="fw-bold mb-2">What's your risk appetite?</h4>
              <p className="text-muted">This determines your investment strategy</p>
            </div>
            <div className="row g-3">
              {riskProfiles.map(profile => (
                <div className="col-12" key={profile.id}>
                  <div
                    className={`d-flex align-items-center p-3 rounded-3 border ${formData.riskProfile === profile.id ? 'border-success bg-success bg-opacity-10' : 'border-light'}`}
                    onClick={() => setFormData(prev => ({ ...prev, riskProfile: profile.id }))}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <div style={{ fontSize: '2rem', marginRight: '16px' }}>{profile.icon}</div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{profile.label}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{profile.desc}</div>
                      <div style={{ fontSize: '0.85rem', color: profile.color, fontWeight: 600 }}>Expected returns: {profile.range}</div>
                    </div>
                    {formData.riskProfile === profile.id && (
                      <FiCheck style={{ color: 'var(--success)', fontSize: '1.5rem' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        const currentQuestion = profileQuestions[questionIndex];
        const currentQuestionValue = formData[currentQuestion.key];
        const currentQuestionValid = currentQuestion.type === 'multi'
          ? currentQuestionValue.length > 0
          : Boolean(currentQuestionValue);

        return (
          <div className="questionnaire-shell">
            <div className="questionnaire-hero card border-0 shadow-lg mb-3">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div className="questionnaire-hero-copy">
                    <div className="questionnaire-kicker mb-2">Tailored for you</div>
                    <h4 className="fw-bold mb-2 mb-md-3">Build a smarter money profile in under 2 minutes</h4>
                    <p className="text-muted mb-0" style={{ maxWidth: '560px' }}>
                      Answer one question at a time and get recommendations that feel personal, not generic.
                    </p>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge rounded-pill text-bg-light border px-3 py-2">Fast setup</span>
                    <span className="badge rounded-pill text-bg-light border px-3 py-2">Personalized advice</span>
                    <span className="badge rounded-pill text-bg-light border px-3 py-2">No financial jargon</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="questionnaire-panel question-card-enter card border-0 shadow-sm">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <div>
                  <div className="questionnaire-kicker">{currentQuestion.section}</div>
                  <h5 className="fw-bold mb-1">Personal finance questionnaire</h5>
                  <p className="text-muted mb-0">Choose the option that feels closest to you.</p>
                </div>
                <div className="questionnaire-counter badge rounded-pill text-bg-success-subtle border border-success-subtle px-3 py-2">
                  {questionIndex + 1} / {profileQuestions.length}
                </div>
              </div>

              <div className="progress questionnaire-progress mb-4" style={{ height: '12px' }}>
                <div
                  className="progress-bar questionnaire-progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${((questionIndex + 1) / profileQuestions.length) * 100}%` }}
                  aria-valuenow={questionIndex + 1}
                  aria-valuemin="0"
                  aria-valuemax={profileQuestions.length}
                />
              </div>

              <div className="questionnaire-question-block">
                <div className="questionnaire-question-number">{currentQuestion.section}</div>
                <div className="questionnaire-question-label">{currentQuestion.label}</div>
                <div className="questionnaire-question-hint">
                  {currentQuestion.type === 'multi' ? 'Select all that apply' : 'Choose one option'}
                </div>

                <div className="questionnaire-option-grid mt-4 btn-group-vertical w-100" role="group" aria-label={currentQuestion.label}>
                  {currentQuestion.options.map(option => {
                    const selected = currentQuestion.type === 'multi'
                      ? currentQuestionValue.includes(option)
                      : currentQuestionValue === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        className={`question-option btn ${selected ? 'btn-success' : 'btn-outline-success'} d-flex justify-content-between align-items-center`}
                        onClick={() => (currentQuestion.type === 'multi'
                          ? toggleMultiAnswer(currentQuestion.key, option)
                          : selectSingleAnswer(currentQuestion.key, option))}
                      >
                        <span>{option}</span>
                        {selected && <FiCheck aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="questionnaire-footer mt-4">
                <div className="questionnaire-status badge text-bg-light border">
                  {currentQuestion.type === 'multi'
                    ? `${currentQuestionValue.length} selected`
                    : currentQuestionValid
                      ? 'Answered'
                      : 'Select an option to continue'}
                </div>
                <div className="questionnaire-nav-hint text-muted small">
                  Use Back to review or Next to continue
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center">
            <div
              className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, var(--success), var(--primary))',
                fontSize: '3rem',
                color: 'white'
              }}
            >
              <FiShield />
            </div>
            <h4 className="fw-bold mb-3">You're all set, {formData.name}!</h4>
            <p className="text-muted mb-4">
              We've gathered everything we need to create your personalized financial plan.
            </p>

            <div className="text-start bg-light p-4 rounded-3 mb-4">
              <h6 className="fw-bold mb-3">📋 Summary</h6>
              <div className="mb-2">
                <span style={{ color: 'var(--text-light)' }}>Goals: </span>
                <span className="fw-semibold">{formData.goals.length} selected</span>
              </div>
              <div className="mb-2">
                <span style={{ color: 'var(--text-light)' }}>Monthly Income: </span>
                <span className="fw-semibold">₹{parseInt(formData.monthlyIncome).toLocaleString()}</span>
              </div>
              <div className="mb-2">
                <span style={{ color: 'var(--text-light)' }}>Monthly Expenses: </span>
                <span className="fw-semibold">₹{parseInt(formData.monthlyExpenses).toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-light)' }}>Risk Profile: </span>
                <span className="fw-semibold text-capitalize">{formData.riskProfile}</span>
              </div>
              <div className="mt-2">
                <span style={{ color: 'var(--text-light)' }}>Questionnaire: </span>
                <span className="fw-semibold">{profileQuestions.length} answers added</span>
              </div>
            </div>

            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              🚀 Your AI-powered financial dashboard is ready. Let's start building your wealth!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h3>FinWise AI</h3>
          <p>Step {currentStep + 1} of {totalSteps}</p>
        </div>

        <div className="onboarding-body">
          {renderStepIndicator()}
          {renderStep()}

          <div className="d-flex justify-content-between mt-4 pt-3 border-top">
            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <FiArrowLeft /> Back
            </button>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleNext}
              disabled={!isStepValid() || loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>
                  {currentStep === totalSteps - 1 ? 'Complete' : 'Next'} <FiArrowRight />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;

