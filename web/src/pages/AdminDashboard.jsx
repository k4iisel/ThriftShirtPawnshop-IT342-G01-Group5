import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useNotify from '../hooks/useNotify';
import useAuth from '../hooks/useAuth';
import logo from '../assets/images/logo.png';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotify();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePawns: 0,
    revenue: 0
  });

  // Use the authentication hook for admin
  useAuth('ADMIN');

  // Set admin user data after authentication is validated
  useEffect(() => {
    // Clear any regular user tokens to prevent conflicts
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Validate admin token on dashboard load
    const validateAdminToken = async () => {
      try {
        const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
        if (adminToken) {
          // Make a request to validate the token
          const response = await fetch('http://localhost:8080/api/admin/health', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
          });

          if (!response.ok) {
            throw new Error('Admin session invalid');
          }
        }
      } catch (error) {
        console.error('Admin token validation error:', error);
        // Clear admin tokens to allow re-login
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    };

    validateAdminToken();

    const adminUserData = sessionStorage.getItem('adminUser') || localStorage.getItem('adminUser');
    if (adminUserData) {
      try {
        setAdminUser(JSON.parse(adminUserData));
      } catch (error) {
        console.error('Error parsing admin user data:', error);
      }
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const apiService = await import('../services/apiService');
        const response = await apiService.default.admin.getDashboardStats();
        if (response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      // Call backend logout API with admin token using apiService
      const apiService = await import('../services/apiService');
      await apiService.default.auth.adminLogout();
    } catch (error) {
      console.error('Admin logout API error:', error);
    }

    // Clear admin tokens regardless of API result
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    notifySuccess('Admin logged out successfully');
    navigate('/admin/login');
  };

  const handleGoToUserLogin = () => {
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo">
            <img src={logo} alt="Thrift Shirt Pawnshop" className="admin-logo-img" />
            <h1>Admin Portal</h1>
          </div>
        </div>

        <div className="admin-header-right">
          <div className="admin-user-info">
            <span className="admin-greeting">Welcome, {adminUser?.username}</span>
            <span className="admin-role-badge">ADMIN</span>
          </div>
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="admin-nav">
        <div className="admin-nav-section">
          <h3>Management</h3>
          <ul>
            <li>
              <Link to="/developer_admin_users" className="admin-nav-link">
                <span className="nav-icon">👥</span> User Management
              </Link>
            </li>
            <li>
              <Link to="/developer_admin_approve" className="admin-nav-link">
                <span className="nav-icon">⚖️</span> Review Requests
              </Link>
            </li>
            <li>
              <Link to="/developer_admin_validate" className="admin-nav-link">
                <span className="nav-icon">✅</span> Item Validation
              </Link>
            </li>
            <li>
              <Link to="/developer_admin_loan_manager" className="admin-nav-link">
                <span className="nav-icon">💰</span> Pawn Management
              </Link>
            </li>
            <li>
              <Link to="/developer_admin_inventory" className="admin-nav-link">
                <span className="nav-icon">📦</span> Inventory
              </Link>
            </li>
            <li>
              <Link to="/developer_admin_wallet" className="admin-nav-link">
                <span className="nav-icon">💳</span> Wallet Management
              </Link>
            </li>
          </ul>
        </div>

        <div className="admin-nav-section">
          <h3>System</h3>
          <ul>
            <li>
              <Link to="/developer_admin_logs" className="admin-nav-link">
                <span className="nav-icon">📜</span> Activity Logs
              </Link>
            </li>
          </ul>
        </div>

        <div className="admin-nav-section">
          <h3>Quick Actions</h3>
          <ul>
            <li>
              <button
                className="admin-nav-button"
                onClick={handleGoToUserLogin}
              >
                Switch to User Portal
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="admin-main">
        <div className="admin-content">
          {/* Welcome Section */}
          <section className="admin-welcome">
            <h2>Welcome to Admin Dashboard</h2>
            <p>Manage your pawnshop system from this central dashboard.</p>
          </section>

          {/* Quick Stats */}
          <section className="admin-stats">
            <h3>System Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.totalUsers}</span>
                  <span className="stat-label">Users</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💎</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.activePawns}</span>
                  <span className="stat-label">Active Loans</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <span className="stat-number">₱{stats.revenue?.toFixed(2)}</span>
                  <span className="stat-label">Revenue</span>
                </div>
              </div>
            </div>
          </section>

          {/* System Status */}
          <section className="admin-system-status">
            <h3>System Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-indicator online"></span>
                <span className="status-label">Database</span>
                <span className="status-value">Online</span>
              </div>

              <div className="status-item">
                <span className="status-indicator online"></span>
                <span className="status-label">Authentication</span>
                <span className="status-value">Active</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="admin-footer">
        <div className="admin-footer-content">
          <p>&copy; 2025 Thrift Shirt Pawnshop</p>
          <p>Logged in as: <strong>{adminUser?.username}</strong></p>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;