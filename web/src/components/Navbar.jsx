import { useNavigate, useLocation } from 'react-router-dom';
import useNotify from '../hooks/useNotify';
import apiService from '../services/apiService';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifySuccess, notifyError } = useNotify();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        // Call backend logout API
        await apiService.auth.logout();
        
        // Clear all authentication data
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
        sessionStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('user');
        
        notifySuccess('Logged out successfully!');
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Even if API call fails, clear storage and redirect
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
        sessionStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('user');
        
        notifySuccess('Logged out successfully!');
        navigate('/login');
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Permanent Sidebar Navigation */}
      <nav className={`navbar sidebar`}>
        <div className="nav-content">
          <button
            className={`nav-button ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
            title="Home"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="nav-label">Home</span>
          </button>

          <button
            className={`nav-button ${isActive('/create') ? 'active' : ''}`}
            onClick={() => navigate('/create')}
            title="Pawn Item"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className="nav-label">Pawn</span>
          </button>

          <button
            className={`nav-button ${isActive('/status') ? 'active' : ''}`}
            onClick={() => navigate('/status')}
            title="My Pawns"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span className="nav-label">My Pawns</span>
          </button>

          <button
            className={`nav-button ${isActive('/browse') ? 'active' : ''}`}
            onClick={() => navigate('/browse')}
            title="Browse"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="nav-label">Browse</span>
          </button>

          <button
            className={`nav-button ${isActive('/notifications') ? 'active' : ''}`}
            onClick={() => navigate('/notifications')}
            title="Notifications"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="nav-label">Notifications</span>
          </button>

          <div className="profile-logout-group">
            <button
              className={`nav-button ${isActive('/profile') ? 'active' : ''}`}
              onClick={() => navigate('/profile')}
              title="Profile"
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="nav-label">Profile</span>
            </button>

            <button
              className="nav-button logout-button"
              onClick={handleLogout}
              title="Logout"
            >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
              <span className="nav-label">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar spacer to prevent content from being hidden behind sidebar */}
      <div className={`navbar-spacer sidebar-spacer`}></div>
    </>
  );
}

export default Navbar;
