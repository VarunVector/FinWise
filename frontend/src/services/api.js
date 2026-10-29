/**
 * Mock API Service Layer
 * All backend API calls go through this service.
 * Replace base URL and endpoints with real backend when ready.
 */

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database
const MOCK_USERS = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@finwise.ai',
    phone: '+91-9876543210',
    password: 'Demo@123',
    isOnboarded: true,
    profile: {
      photo: null,
      goals: [],
      monthlyIncome: 0,
      monthlyExpenses: 0,
      riskProfile: null,
      totalInvestments: 1250000,
      totalReturns: 187500,
      portfolioValue: 1437500,
      sipAmount: 25000,
      fdAmount: 300000,
      equityAmount: 875000,
    },
    transactions: [
      { id: 'TXN001', type: 'credit', category: 'Salary', amount: 95000, date: '2026-07-28', status: 'completed' },
      { id: 'TXN002', type: 'debit', category: 'SIP Investment', amount: 25000, date: '2026-07-25', status: 'completed' },
      { id: 'TXN003', type: 'debit', category: 'Shopping', amount: 3500, date: '2026-07-24', status: 'completed' },
      { id: 'TXN004', type: 'debit', category: 'Dining', amount: 1200, date: '2026-07-23', status: 'completed' },
      { id: 'TXN005', type: 'credit', category: 'Freelance', amount: 15000, date: '2026-07-22', status: 'completed' },
      { id: 'TXN006', type: 'debit', category: 'EMI Payment', amount: 18500, date: '2026-07-20', status: 'completed' },
      { id: 'TXN007', type: 'debit', category: 'Utilities', amount: 4200, date: '2026-07-18', status: 'completed' },
      { id: 'TXN008', type: 'credit', category: 'Dividend', amount: 3200, date: '2026-07-15', status: 'completed' },
    ]
  }
];

// Store registered users in localStorage for persistence
const getUsers = () => {
  const stored = localStorage.getItem('finwise_users');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('finwise_users', JSON.stringify(MOCK_USERS));
  return MOCK_USERS;
};

const saveUsers = (users) => {
  localStorage.setItem('finwise_users', JSON.stringify(users));
};

// Generate unique ID
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// Generate a random 6-digit OTP
const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// ============ AUTHENTICATION API ============

export const authAPI = {
  // Login
  login: async (email, password) => {
    await delay(800);
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const token = 'mock_token_' + user.id + '_' + Date.now();
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    };
  },

  // Register
  register: async (userData) => {
    await delay(1000);
    const users = getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email already registered');
    }
    
    // Check if phone already exists
    if (users.find(u => u.phone === userData.phone)) {
      throw new Error('Phone number already registered');
    }
    
    const newUser = {
      id: generateId(),
      ...userData,
      isOnboarded: false,
      profile: {
        photo: null,
        goals: [],
        monthlyIncome: 0,
        monthlyExpenses: 0,
        riskProfile: null,
        totalInvestments: 0,
        totalReturns: 0,
        portfolioValue: 0,
        sipAmount: 0,
        fdAmount: 0,
        equityAmount: 0,
      },
      transactions: []
    };
    
    users.push(newUser);
    saveUsers(users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    const token = 'mock_token_' + newUser.id + '_' + Date.now();
    
    return {
      success: true,
      message: 'Registration successful',
      token,
      user: userWithoutPassword
    };
  },

  // Forgot Password - Send OTP
  sendOtp: async (email) => {
    await delay(600);
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('No account found with this email');
    }
    
    // Generate a real random OTP (in production, this would be sent via email/SMS)
    const otp = generateOtp();
    localStorage.setItem('reset_otp_' + email, otp);
    
    // Simulate sending OTP via email (in production, integrate with email/SMS gateway)
    console.log(`[SIMULATED EMAIL] OTP for ${email}: ${otp}`);
    
    return {
      success: true,
      message: 'OTP sent to your registered email'
    };
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    await delay(500);
    const storedOtp = localStorage.getItem('reset_otp_' + email);
    
    if (storedOtp !== otp) {
      throw new Error('Invalid OTP');
    }
    
    localStorage.setItem('otp_verified_' + email, 'true');
    localStorage.removeItem('reset_otp_' + email);
    
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  },

  // Reset Password
  resetPassword: async (email, newPassword) => {
    await delay(800);
    const verified = localStorage.getItem('otp_verified_' + email);
    if (!verified) {
      throw new Error('OTP not verified. Please verify OTP first.');
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    localStorage.removeItem('otp_verified_' + email);
    
    return {
      success: true,
      message: 'Password reset successful'
    };
  },

// Send OTP for login
  sendOtpLogin: async (email) => {
    await delay(600);
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('No account found with this email');
    }
    
    // Generate a real random OTP
    const otp = generateOtp();
    localStorage.setItem('login_otp_' + email, otp);
    
    // Simulate sending OTP via email
    console.log(`[SIMULATED EMAIL] Login OTP for ${email}: ${otp}`);
    
    return {
      success: true,
      message: 'OTP sent to your registered email',
      otp: otp // Return OTP for demo display (remove in production)
    };
  },

  // Verify OTP and login
  verifyOtpLogin: async (email, otp) => {
    await delay(500);
    const storedOtp = localStorage.getItem('login_otp_' + email);
    
    if (storedOtp !== otp) {
      throw new Error('Invalid OTP');
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    localStorage.removeItem('login_otp_' + email);
    
    const token = 'mock_token_' + user.id + '_' + Date.now();
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    };
  },

  // Register user and send OTP (unverified registration)
  sendOtpRegistration: async (userData) => {
    await delay(1000);
    const users = getUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email already registered');
    }
    
    // Check if phone already exists
    if (users.find(u => u.phone === userData.phone)) {
      throw new Error('Phone number already registered');
    }
    
    const newUser = {
      id: generateId(),
      ...userData,
      isVerified: false,
      isOnboarded: false,
      profile: {
        photo: null,
        goals: [],
        monthlyIncome: 0,
        monthlyExpenses: 0,
        riskProfile: null,
        totalInvestments: 0,
        totalReturns: 0,
        portfolioValue: 0,
        sipAmount: 0,
        fdAmount: 0,
        equityAmount: 0,
      },
      transactions: []
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Generate a real random OTP
    const otp = generateOtp();
    localStorage.setItem('register_otp_' + userData.email, otp);
    
    // Simulate sending OTP via email
    console.log(`[SIMULATED EMAIL] Registration OTP for ${userData.email}: ${otp}`);
    
// Store temp user data for after OTP verification
    localStorage.setItem('pending_registration_' + userData.email, JSON.stringify(newUser));
    
    return {
      success: true,
      message: 'OTP sent to your email for verification',
      otp: otp // Return OTP for demo display (remove in production)
    };
  },

  // Verify OTP and activate registration
  verifyOtpRegistration: async (email, otp) => {
    await delay(500);
    const storedOtp = localStorage.getItem('register_otp_' + email);
    
    if (storedOtp !== otp) {
      throw new Error('Invalid OTP');
    }
    
    const pendingUserJson = localStorage.getItem('pending_registration_' + email);
    if (!pendingUserJson) {
      throw new Error('Registration session expired. Please register again.');
    }
    
    const pendingUser = JSON.parse(pendingUserJson);
    pendingUser.isVerified = true;
    
    // Update user in the main users array
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === pendingUser.id);
    if (userIndex !== -1) {
      users[userIndex].isVerified = true;
      saveUsers(users);
    }
    
    localStorage.removeItem('register_otp_' + email);
    localStorage.removeItem('pending_registration_' + email);
    
    const token = 'mock_token_' + pendingUser.id + '_' + Date.now();
    const { password: _, ...userWithoutPassword } = pendingUser;
    
    return {
      success: true,
      message: 'Email verified successfully',
      token,
      user: userWithoutPassword
    };
  },

  // Update onboarding status
  completeOnboarding: async (userId, profileData) => {
    await delay(800);
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex].isOnboarded = true;
    users[userIndex].profile = { ...users[userIndex].profile, ...profileData };
    saveUsers(users);
    
    const { password: _, ...userWithoutPassword } = users[userIndex];
    return {
      success: true,
      message: 'Onboarding completed',
      user: userWithoutPassword
    };
  },

  // Get AI advice (mock)
  getAIAdvice: async (userId, query) => {
    await delay(1000);
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    const profile = user?.profile;
    
    const adviceResponses = {
      investment: `Based on your risk profile (${profile?.riskProfile || 'moderate'}) and monthly income of ₹${(profile?.monthlyIncome || 0).toLocaleString()}, I recommend: 
        1. Increase your SIP to ₹${Math.round((profile?.monthlyIncome || 0) * 0.35).toLocaleString()}/month
        2. Allocate 60% to large-cap mutual funds
        3. Keep 20% in debt funds for stability
        4. Invest 20% in gold ETFs for diversification`,
      
      retirement: `For retirement planning at age 30 with a goal of ₹2 Cr by 60:
        - Monthly SIP needed: ~₹12,000
        - Expected returns: 12% CAGR
        - Recommended: PPF + ELSS + NPS combination
        - Start now to leverage compounding!`,
      
      tax: `Tax saving suggestions for FY 2026-27:
        1. Max out Section 80C: ₹1.5L (ELSS, PPF, EPF)
        2. Section 80D Health Insurance: Up to ₹25,000
        3. NPS under Section 80CCD(1B): Additional ₹50,000
        - Total potential tax saving: ~₹46,800`,
      
      budget: `Based on your income of ₹${(profile?.monthlyIncome || 0).toLocaleString()}:
        - Needs (50%): ₹${Math.round((profile?.monthlyIncome || 0) * 0.5).toLocaleString()}
        - Wants (30%): ₹${Math.round((profile?.monthlyIncome || 0) * 0.3).toLocaleString()}
        - Savings (20%): ₹${Math.round((profile?.monthlyIncome || 0) * 0.2).toLocaleString()}
        You save ₹${((profile?.monthlyIncome || 0) - (profile?.monthlyExpenses || 0)).toLocaleString()}/month. ${((profile?.monthlyIncome || 0) - (profile?.monthlyExpenses || 0)) > 0 ? 'Great job!' : 'Consider cutting expenses.'}`,
      
      default: `Hello! I'm your AI Financial Advisor. I can help you with:
        - 💰 Investment planning
        - 🎯 Retirement goals
        - 📊 Portfolio analysis
        - 💵 Tax optimization
        - 📝 Budget planning
        
        What would you like to discuss today?`
    };
    
    // Simple keyword matching for demo
    const lowerQuery = query.toLowerCase();
    let response;
    if (lowerQuery.includes('invest') || lowerQuery.includes('mutual') || lowerQuery.includes('stock')) {
      response = adviceResponses.investment;
    } else if (lowerQuery.includes('retire') || lowerQuery.includes('pension') || lowerQuery.includes('old')) {
      response = adviceResponses.retirement;
    } else if (lowerQuery.includes('tax') || lowerQuery.includes('save tax') || lowerQuery.includes('80c')) {
      response = adviceResponses.tax;
    } else if (lowerQuery.includes('budget') || lowerQuery.includes('spend') || lowerQuery.includes('expense')) {
      response = adviceResponses.budget;
    } else {
      response = adviceResponses.default;
    }
    
    return {
      success: true,
      response,
      timestamp: new Date().toISOString()
    };
  }
};

// ============ STOCK MARKET DATA (MOCK) ============

export const marketAPI = {
  getIndices: async () => {
    await delay(500);
    return {
      success: true,
      data: {
        sensex: { value: 82456.78, change: 245.60, percentChange: 0.30 },
        nifty: { value: 25123.45, change: 78.90, percentChange: 0.32 },
        bankNifty: { value: 51234.56, change: -123.45, percentChange: -0.24 },
      }
    };
  }
};

// ============ STOCK PREDICTIONS (LSTM / MOCK) ============

// Helper to generate a 60-day history + next day prediction for graph data
const buildGraphData = (basePrice, drift, volatility, predicted) => {
  const data = [];
  let price = basePrice;
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    price = price * (1 + drift + (Math.random() - 0.5) * volatility);
    data.push({
      date: d.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100
    });
  }
  data.push({ date: 'Next Day', price: predicted });
  return data;
};

// NIFTY 50 stock prediction mock dataset (mirrors output of generate_predictions.py)
const STOCK_PREDICTIONS = [
  {
    symbol: 'RELIANCE',
    live_price: 2956.40,
    predicted_price: 3012.75,
    expected_return: 1.91,
    confidence: 87,
    signal: 'BUY',
    graph_data: buildGraphData(2956.40, 0.0004, 0.015, 3012.75),
    news: [
      { source: 'Economic Times', title: 'Reliance Industries Q3 profit jumps 12% on retail, telecom growth', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Mint', title: 'RIL announces ₹15,000 crore capex for green energy expansion', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Business Standard', title: 'Reliance Jio adds 3.2 million subscribers in January', url: '#', publishedAt: new Date().toISOString() },
    ]
  },
  {
    symbol: 'TCS',
    live_price: 3892.10,
    predicted_price: 3945.60,
    expected_return: 1.38,
    confidence: 82,
    signal: 'BUY',
    graph_data: buildGraphData(3892.10, 0.0003, 0.012, 3945.60),
    news: [
      { source: 'Reuters', title: 'TCS wins $1.2 billion deal from UK telecom major', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Economic Times', title: 'TCS announces buyback of ₹17,000 crore', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Mint', title: 'IT sector hiring picks up as TCS plans 40,000 freshers', url: '#', publishedAt: new Date().toISOString() },
    ]
  },
  {
    symbol: 'HDFC Bank',
    live_price: 1688.35,
    predicted_price: 1712.20,
    expected_return: 1.41,
    confidence: 79,
    signal: 'BUY',
    graph_data: buildGraphData(1688.35, 0.00035, 0.014, 1712.20),
    news: [
      { source: 'Financial Express', title: 'HDFC Bank Q3 net profit rises 15%, NII grows 12%', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Business Standard', title: 'HDFC Bank credit growth outpaces industry average', url: '#', publishedAt: new Date().toISOString() },
    ]
  },
  {
    symbol: 'INFY',
    live_price: 1445.80,
    predicted_price: 1421.35,
    expected_return: -1.69,
    confidence: 76,
    signal: 'SELL',
    graph_data: buildGraphData(1445.80, -0.0004, 0.016, 1421.35),
    news: [
      { source: 'Reuters', title: 'Infosys lowers revenue guidance amid weak client spending', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Economic Times', title: 'Infosys attrition rate inches up to 18.5%', url: '#', publishedAt: new Date().toISOString() },
    ]
  },
  {
    symbol: 'ICICI Bank',
    live_price: 1189.55,
    predicted_price: 1204.90,
    expected_return: 1.29,
    confidence: 84,
    signal: 'BUY',
    graph_data: buildGraphData(1189.55, 0.0003, 0.012, 1204.90),
    news: [
      { source: 'Mint', title: 'ICICI Bank Q3 profit beats estimates, asset quality stable', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Business Standard', title: 'ICICI Bank expands retail lending with new digital products', url: '#', publishedAt: new Date().toISOString() },
    ]
  },
  {
    symbol: 'SBIN',
    live_price: 782.45,
    predicted_price: 798.60,
    expected_return: 2.06,
    confidence: 81,
    signal: 'BUY',
    graph_data: buildGraphData(782.45, 0.00045, 0.017, 798.60),
    news: [
      { source: 'Financial Express', title: 'SBI Q3 net profit surges 25% on lower provisions', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Economic Times', title: 'SBI plans to raise ₹20,000 crore via infra bonds', url: '#', publishedAt: new Date().toISOString() },
    ]
  },
  {
    symbol: 'BHARTIARTL',
    live_price: 1567.30,
    predicted_price: 1589.45,
    expected_return: 1.41,
    confidence: 78,
    signal: 'BUY',
    graph_data: buildGraphData(1567.30, 0.00032, 0.013, 1589.45),
    news: [
      { source: 'Reuters', title: 'Bharti Airtel ARPU improves on premium tariff plans', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Mint', title: 'Airtel 5G subscribers cross 80 million mark', url: '#', publishedAt: new Date().toISOString() },
    ]
  },
  {
    symbol: 'ITC',
    live_price: 438.20,
    predicted_price: 431.75,
    expected_return: -1.47,
    confidence: 73,
    signal: 'SELL',
    graph_data: buildGraphData(438.20, -0.00035, 0.011, 431.75),
    news: [
      { source: 'Business Standard', title: 'ITC hotels demerger effective from new fiscal', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Economic Times', title: 'ITC FMCG business faces margin pressure on input costs', url: '#', publishedAt: new Date().toISOString() },
    ]
  },
  {
    symbol: 'LT',
    live_price: 3642.90,
    predicted_price: 3688.15,
    expected_return: 1.24,
    confidence: 80,
    signal: 'BUY',
    graph_data: buildGraphData(3642.90, 0.00028, 0.014, 3688.15),
    news: [
      { source: 'Mint', title: 'L&T wins ₹7,500 crore order for metro rail project', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Reuters', title: 'L&T IT services arm eyes double-digit growth', url: '#', publishedAt: new Date().toISOString() },
    ]
  },
  {
    symbol: 'HINDUNILVR',
    live_price: 2456.70,
    predicted_price: 2489.30,
    expected_return: 1.33,
    confidence: 77,
    signal: 'BUY',
    graph_data: buildGraphData(2456.70, 0.0003, 0.012, 2489.30),
    news: [
      { source: 'Economic Times', title: 'HUL Q3 revenue grows 8%, volume growth recovers', url: '#', publishedAt: new Date().toISOString() },
      { source: 'Business Standard', title: 'HUL premiumisation strategy paying off', url: '#', publishedAt: new Date().toISOString() },
    ]
  },
];

export const stockPredictionAPI = {
  // Fetch all stock predictions
  getPredictions: async () => {
    await delay(900);
    return {
      success: true,
      data: STOCK_PREDICTIONS
    };
  }
};

