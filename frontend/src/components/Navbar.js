import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiMessageSquare, FiLogOut, FiUser, FiBell, FiCpu } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container">
        <Link className="brand" to="/dashboard">
          Fin<span>Wise</span> AI
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}
                to="/dashboard"
              >
                <FiGrid className="nav-icon" />
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}
                to="/ai-advisor"
              >
                <FiMessageSquare className="nav-icon" />
                AI Advisor
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}
                to="/stock-prediction"
              >
                <FiCpu className="nav-icon" />
                Stock Prediction
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link position-relative p-1" style={{ color: '#7f8c8d' }}>
              <FiBell size={20} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                3
              </span>
            </button>

            <div className="dropdown">
              <button
                className="btn btn-link dropdown-toggle text-decoration-none d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ color: 'var(--text-primary)' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '34px',
                    height: '34px',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="d-none d-md-inline" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {user?.name || 'User'}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ borderRadius: '12px', border: 'none', padding: '8px' }}>
                <li>
                  <button className="dropdown-item" style={{ borderRadius: '8px', padding: '8px 16px' }}>
                    <FiUser className="me-2" /> Profile
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                    style={{ borderRadius: '8px', padding: '8px 16px' }}
                  >
                    <FiLogOut className="me-2" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

