import React, { useState, createContext, useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutGrid,
  PieChart,
  Target,
  ReceiptText,
  Landmark,
  TrendingUp,
  Layers,
  Coins,
  ShieldCheck,
  Sparkles,
  LineChart,
  User,
  Settings,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import AddTransactionModal from '../modals/AddTransactionModal';
import AddGoalModal from '../modals/AddGoalModal';
import AddHoldingModal from '../modals/AddHoldingModal';
import UpdateProfileModal from '../modals/UpdateProfileModal';
import ClerkSignOutButton from '../ClerkSignOutButton';

export const ModalContext = createContext(null);

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a MainLayout');
  }
  return context;
};

// Detect if a real Clerk publishable key is configured
const isClerkConfigured = () => {
  const key = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
  return !!key && !key.includes('YOUR_CLERK');
};

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const clerkEnabled = isClerkConfigured();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Modal states
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [holdingModalOpen, setHoldingModalOpen] = useState(false);
  const [holdingCategory, setHoldingCategory] = useState('Mutual Funds');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const openHoldingModalWithCategory = (cat = 'Mutual Funds') => {
    setHoldingCategory(cat);
    setHoldingModalOpen(true);
  };

  const modalActions = {
    openAddTransaction: () => setTransactionModalOpen(true),
    openAddGoal: () => setGoalModalOpen(true),
    openAddHolding: openHoldingModalWithCategory,
    openUpdateProfile: () => setProfileModalOpen(true),
  };

  // Determine page title for top breadcrumb
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/portfolio') return 'Portfolio';
    if (path === '/goals') return 'Goal Planning';
    if (path === '/transactions') return 'Transactions';
    if (path === '/investments/mutual-funds') return 'Mutual Funds';
    if (path === '/investments/stocks') return 'Stocks';
    if (path === '/investments/etfs') return 'ETFs';
    if (path === '/investments/gold') return 'Gold';
    if (path === '/investments/fixed-deposits') return 'Fixed Deposits';
    if (path === '/ai-advisor') return 'AI Advisor';
    if (path === '/stock-prediction') return 'Stock Predictions';
    if (path === '/profile') return 'Profile';
    if (path === '/settings') return 'Settings';
    return 'Dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user?.name || 'Demo User';
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'DU';

  return (
    <ModalContext.Provider value={modalActions}>
      <div className="fintech-app-container d-flex">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="sidebar-backdrop d-lg-none"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fintech-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Logo */}
          <div className="sidebar-brand-wrapper d-flex align-items-center justify-content-between">
            <NavLink to="/dashboard" className="sidebar-brand d-flex align-items-center gap-2.5 text-decoration-none">
              <div className="brand-logo-icon">
                <Compass size={22} className="text-white" />
              </div>
              <span className="brand-logo-text">
                Fin<span className="text-teal">Wise</span>AI
              </span>
            </NavLink>
            <button
              className="btn btn-sm btn-link d-lg-none text-muted p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="sidebar-nav-container custom-scrollbar">
            {/* OVERVIEW */}
            <div className="nav-section-label">Overview</div>
            <ul className="nav-section-list">
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <LayoutGrid size={18} className="nav-icon" />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/portfolio"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <PieChart size={18} className="nav-icon" />
                  <span>Portfolio</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/goals"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Target size={18} className="nav-icon" />
                  <span>Goal Planning</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/transactions"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <ReceiptText size={18} className="nav-icon" />
                  <span>Transactions</span>
                </NavLink>
              </li>
            </ul>

            {/* INVESTMENTS */}
            <div className="nav-section-label">Investments</div>
            <ul className="nav-section-list">
              <li>
                <NavLink
                  to="/investments/mutual-funds"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Landmark size={18} className="nav-icon" />
                  <span>Mutual Funds</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/investments/stocks"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <TrendingUp size={18} className="nav-icon" />
                  <span>Stocks</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/investments/etfs"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Layers size={18} className="nav-icon" />
                  <span>ETFs</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/investments/gold"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Coins size={18} className="nav-icon" />
                  <span>Gold</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/investments/fixed-deposits"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <ShieldCheck size={18} className="nav-icon" />
                  <span>Fixed Deposits</span>
                </NavLink>
              </li>
            </ul>

            {/* INTELLIGENCE */}
            <div className="nav-section-label">Intelligence</div>
            <ul className="nav-section-list">
              <li>
                <NavLink
                  to="/ai-advisor"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Sparkles size={18} className="nav-icon" />
                  <span>AI Advisor</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/stock-prediction"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <LineChart size={18} className="nav-icon" />
                  <span>Stock Predictions</span>
                </NavLink>
              </li>
            </ul>

            {/* ACCOUNT */}
            <div className="nav-section-label">Account</div>
            <ul className="nav-section-list">
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <User size={18} className="nav-icon" />
                  <span>Profile</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Settings size={18} className="nav-icon" />
                  <span>Settings</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <div className="sidebar-footer-text">
              Demo mode · sample data stored in this browser
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="fintech-main-wrapper flex-grow-1 d-flex flex-column">
          {/* Top Header */}
          <header className="fintech-header d-flex align-items-center justify-content-between px-3 px-lg-4">
            {/* Left: Mobile Toggle & Breadcrumbs */}
            <div className="d-flex align-items-center gap-2.5">
              <button
                className="btn btn-sm btn-header-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle Navigation"
              >
                <Menu size={18} />
              </button>

              <div className="header-breadcrumbs d-flex align-items-center gap-2">
                <span className="breadcrumb-current fw-semibold">{getPageTitle()}</span>
                <span className="badge-demo-mode">Demo mode</span>
              </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="d-flex align-items-center gap-3">
              {/* Notification Bell */}
              <div className="position-relative">
                <button
                  className="btn btn-icon-header position-relative"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="notification-badge-pulse">5</span>
                </button>
                <NotificationDropdown
                  isOpen={notificationOpen}
                  onClose={() => setNotificationOpen(false)}
                />
              </div>

              {/* User Dropdown */}
              <div className="position-relative">
                <button
                  className="user-profile-button d-flex align-items-center gap-2"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="user-avatar-circle">{userInitials}</div>
                  <span className="user-name-text d-none d-sm-inline">{displayName}</span>
                  <ChevronDown size={14} className="text-muted" />
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-popover shadow-sm">
                    <div className="user-dropdown-header p-3 border-bottom">
                      <div className="fw-semibold text-dark">{displayName}</div>
                      <div className="small text-muted">{user?.email || 'demo@finwise.ai'}</div>
                    </div>
                    <ul className="list-unstyled mb-0 py-1">
                      <li>
                        <button
                          className="user-dropdown-item d-flex align-items-center gap-2"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('/profile');
                          }}
                        >
                          <User size={15} />
                          <span>Financial Profile</span>
                        </button>
                      </li>
                      <li>
                        <button
                          className="user-dropdown-item d-flex align-items-center gap-2"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('/settings');
                          }}
                        >
                          <SlidersHorizontal size={15} />
                          <span>Settings & Health</span>
                        </button>
                      </li>
                      <li className="border-top my-1"></li>
                      <li>
                        {clerkEnabled ? (
                          <div className="p-2">
                            <ClerkSignOutButton onSignOut={handleLogout} />
                          </div>
                        ) : (
                          <button
                            className="user-dropdown-item text-danger d-flex align-items-center gap-2"
                            onClick={handleLogout}
                          >
                            <LogOut size={15} />
                            <span>Sign out</span>
                          </button>
                        )}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Body Viewport */}
          <main className="fintech-content-body flex-grow-1 p-3 p-lg-4">
            {children}
          </main>
        </div>

        {/* Global Modals */}
        <AddTransactionModal
          isOpen={transactionModalOpen}
          onClose={() => setTransactionModalOpen(false)}
        />
        <AddGoalModal
          isOpen={goalModalOpen}
          onClose={() => setGoalModalOpen(false)}
        />
        <AddHoldingModal
          isOpen={holdingModalOpen}
          onClose={() => setHoldingModalOpen(false)}
          defaultCategory={holdingCategory}
        />
        <UpdateProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      </div>
    </ModalContext.Provider>
  );
}

