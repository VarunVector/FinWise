import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiShield, FiMessageSquare, FiArrowRight, FiStar } from 'react-icons/fi';
import { BiBarChartAlt2, BiWallet, BiTargetLock } from 'react-icons/bi';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiMessageSquare />,
      title: 'AI-Powered Advice',
      description: 'Get personalized financial recommendations powered by advanced AI algorithms tailored to your goals.',
      bg: 'rgba(0,168,107,0.1)',
      color: 'var(--primary)'
    },
    {
      icon: <BiBarChartAlt2 />,
      title: 'Smart Portfolio Tracker',
      description: 'Track all your investments - mutual funds, stocks, FD - in one unified dashboard with real-time insights.',
      bg: 'rgba(52,152,219,0.1)',
      color: 'var(--info)'
    },
    {
      icon: <BiTargetLock />,
      title: 'Goal-Based Planning',
      description: 'Set financial goals and let our AI create a customized roadmap to achieve them faster.',
      bg: 'rgba(255,179,0,0.1)',
      color: 'var(--accent)'
    },
    {
      icon: <BiWallet />,
      title: 'Expense Intelligence',
      description: 'Automatically categorize and analyze your spending patterns to identify saving opportunities.',
      bg: 'rgba(231,76,60,0.1)',
      color: 'var(--danger)'
    },
    {
      icon: <FiShield />,
      title: 'Risk Assessment',
      description: 'Understand your risk profile with our comprehensive assessment and get suitable recommendations.',
      bg: 'rgba(46,204,113,0.1)',
      color: 'var(--success)'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Market Insights',
      description: 'Stay informed with live market data, trends, and AI-generated investment research.',
      bg: 'rgba(155,89,182,0.1)',
      color: '#9B59B6'
    }
  ];

  const stats = [
    { value: '₹500Cr+', label: 'Assets Managed' },
    { value: '50K+', label: 'Happy Investors' },
    { value: '15%', label: 'Avg. Returns' },
    { value: '4.8★', label: 'User Rating' }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      text: 'FinWise AI helped me grow my savings by 40% in 6 months. The AI recommendations are incredibly accurate!',
      avatar: 'PS',
      rating: 5
    },
    {
      name: 'Rahul Verma',
      role: 'Business Owner',
      text: 'The goal-based planning feature is a game-changer. I\'m now on track to buy my dream home by 2028.',
      avatar: 'RV',
      rating: 5
    },
    {
      name: 'Ananya Patel',
      role: 'Doctor',
      text: 'Finally, a financial app that understands my risk profile. The tax saving tips saved me ₹45,000 this year!',
      avatar: 'AP',
      rating: 5
    }
  ];

  return (
    <div className="landing-section">
      {/* Navigation */}
      <nav className="navbar navbar-dark navbar-expand-lg position-fixed w-100" style={{ zIndex: 1000, background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="container">
          <Link className="brand" to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 800 }}>
            Fin<span style={{ color: 'white' }}>Wise</span> AI
          </Link>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light btn-sm px-4" onClick={() => navigate('/login')} style={{ borderRadius: '8px' }}>
              Login
            </button>
            <button className="btn btn-primary btn-sm px-4" onClick={() => navigate('/register')} style={{ borderRadius: '8px' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="hero-badge">
                <FiStar /> AI-Powered Financial Advisor
              </div>
              <h1 className="hero-title">
                Your Personal <span className="highlight">AI Financial</span> Advisor
              </h1>
              <p className="hero-subtitle">
                Make smarter financial decisions with AI-driven insights. Track investments, 
                plan goals, and optimize your wealth — all in one intelligent platform.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <button
                  className="btn btn-primary btn-lg d-flex align-items-center gap-2 px-4"
                  onClick={() => navigate('/register')}
                >
                  Start Your Journey <FiArrowRight />
                </button>
                <button
                  className="btn btn-outline-light btn-lg px-4"
                  onClick={() => navigate('/login')}
                >
                  Watch Demo
                </button>
              </div>
              <div className="hero-stats">
                {stats.map((stat, idx) => (
                  <div className="hero-stat-item" key={idx}>
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <div className="position-relative">
                {/* Dashboard Preview */}
                <div className="bg-white rounded-4 shadow-lg p-4 animated-float" style={{ transform: 'perspective(1000px) rotateY(-5deg)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Portfolio Value</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>₹14,37,500</div>
                    </div>
                    <div className="badge bg-success bg-opacity-10 text-success px-3 py-2" style={{ borderRadius: '8px' }}>
                      +13.5%
                    </div>
                  </div>
                  <div className="d-flex gap-2 mb-3">
                    <div className="flex-fill p-2 rounded-2" style={{ background: 'rgba(0,168,107,0.05)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>SIP</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>₹25K</div>
                    </div>
                    <div className="flex-fill p-2 rounded-2" style={{ background: 'rgba(52,152,219,0.05)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>FD</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>₹3L</div>
                    </div>
                    <div className="flex-fill p-2 rounded-2" style={{ background: 'rgba(255,179,0,0.05)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Stocks</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>₹8.7L</div>
                    </div>
                  </div>
                  <div className="progress-styled progress mb-2">
                    <div className="progress-bar" style={{ width: '75%' }}></div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Goal Progress</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 position-relative" style={{ zIndex: 1 }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="text-white fw-bold mb-3" style={{ fontSize: '2.2rem' }}>
              Everything You Need for <span className="gradient-text">Financial Success</span>
            </h2>
            <p className="text-white-50" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
              From intelligent advice to comprehensive tracking, we've got you covered
            </p>
          </div>
          <div className="row g-4">
            {features.map((feature, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="feature-card">
                  <div className="feature-icon" style={{ background: feature.bg, color: feature.color }}>
                    {feature.icon}
                  </div>
                  <h5>{feature.title}</h5>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 position-relative" style={{ zIndex: 1 }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="text-white fw-bold mb-3" style={{ fontSize: '2rem' }}>
              What Our <span className="gradient-text">Users Say</span>
            </h2>
          </div>
          <div className="row g-4">
            {testimonials.map((t, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="feature-card h-100">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-flex align-items-center justify-content-center rounded-circle me-3"
                      style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', color: 'white', fontWeight: 600, fontSize: '1.1rem' }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-white fw-semibold">{t.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{t.role}</div>
                    </div>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    "{t.text}"
                  </p>
                  <div style={{ color: 'var(--accent)' }}>
                    {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 position-relative" style={{ zIndex: 1 }}>
        <div className="container text-center">
          <div className="p-5 rounded-4" style={{ background: 'linear-gradient(135deg, rgba(0,168,107,0.15), rgba(0,168,107,0.05))', border: '1px solid rgba(0,168,107,0.2)' }}>
            <h2 className="text-white fw-bold mb-3">Ready to Transform Your Financial Future?</h2>
            <p className="text-white-50 mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Join 50,000+ smart investors who are already using FinWise AI to achieve their financial goals.
            </p>
            <button
              className="btn btn-primary btn-lg px-5"
              onClick={() => navigate('/register')}
            >
              Get Started Free <FiArrowRight className="ms-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-top border-white border-opacity-10 position-relative" style={{ zIndex: 1 }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <Link className="brand" to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '1.3rem', fontWeight: 800 }}>
                Fin<span style={{ color: 'rgba(255,255,255,0.8)' }}>Wise</span> AI
              </Link>
              <p className="text-white-50 mt-2" style={{ fontSize: '0.85rem' }}>
                © 2026 FinWise AI. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex gap-4 justify-content-md-end">
                <Link to="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy</Link>
                <Link to="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>Terms</Link>
                <Link to="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

