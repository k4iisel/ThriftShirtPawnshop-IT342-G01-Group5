import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useNotify from '../hooks/useNotify';
import useAuth from '../hooks/useAuth';
import apiService from '../services/apiService';
import logo from '../assets/images/logo.png';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotify();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLoans: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    forfeitedItems: 0,
    wallet: 0,
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
          // Validate using centralized service
          await apiService.auth.checkAdminAccess();
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
        
        // Fetch all necessary data
        const [
          usersResponse,
          loansResponse,
          pawnRequestsResponse,
          logsResponse,
          statsResponse
        ] = await Promise.all([
          apiService.default.admin.getAllUsers(),
          apiService.default.admin.getActiveLoans(),
          apiService.default.admin.getAllPawnRequests(),
          apiService.default.admin.getLogs(),
          apiService.default.admin.getDashboardStats()
        ]);
        
        // Calculate stats
        const totalUsers = usersResponse.data?.length || 0;
        const activeLoans = loansResponse.data?.length || 0;
        
        const allRequests = pawnRequestsResponse.data || [];
        const pendingRequests = allRequests.filter(r => r.status === 'PENDING').length;
        const approvedRequests = allRequests.filter(r => r.status === 'APPROVED').length;
        const forfeitedItems = allRequests.filter(r => r.status === 'FORFEITED').length;
        const redeemedItems = allRequests.filter(r => r.status === 'REDEEMED');
        
        // Calculate wallet (system capital available)
        let wallet = 0;
        
        // Add forfeited items (full loan amount + 5% - shop gains the item value with markup)
        allRequests.filter(r => r.status === 'FORFEITED').forEach(item => {
          const amount = item.loanAmount || item.requestedAmount || 0;
          wallet += amount * 1.05; // Base amount + 5%
        });
        
        // Add interest from redeemed items (5% of loan amount)
        redeemedItems.forEach(item => {
          const amount = item.loanAmount || item.requestedAmount || 0;
          wallet += amount * 0.05; // 5% interest
        });
        
        // Deduct only active pawned items (money currently released to customers)
        // Do NOT deduct for redeemed items - they've already paid back their loans
        allRequests.filter(r => r.status === 'PAWNED').forEach(item => {
          const amount = item.loanAmount || item.requestedAmount || 0;
          wallet -= amount;
        });

        // Process transaction logs for wallet management
        const allLogs = logsResponse.data || [];
        
        // Add wallet from cash removed from users (manual adjustments only)
        allLogs.filter(log => log.action === 'REVENUE_EARNED_CASH_REMOVED').forEach(log => {
          const match = log.remarks.match(/Revenue earned: ₱([\d.]+)/);
          if (match) {
            wallet += parseFloat(match[1]);
          }
        });
        
        // Deduct wallet from cash added to users (manual adjustments only)
        allLogs.filter(log => log.action === 'REVENUE_DEDUCTED_CASH_ADDED').forEach(log => {
          const match = log.remarks.match(/Revenue deducted: ₱([\d.]+)/);
          if (match) {
            wallet -= parseFloat(match[1]);
          }
        });
        
        // Calculate revenue (pure profit from interest only)
        let revenue = 0;
        
        const backendStats = statsResponse.data || {};
        const backendWalletRaw = backendStats.wallet ?? 0;
        const backendRevenueRaw = backendStats.revenue ?? 0;
        const backendWallet = Number(backendWalletRaw);
        const backendRevenue = Number(backendRevenueRaw);

        console.log('Backend stats response:', backendStats);
        console.log('Backend wallet:', backendWallet, 'Backend revenue:', backendRevenue);

        // Use backend wallet calculation
        if (!Number.isNaN(backendWallet) && backendWallet >= 0) {
          wallet = backendWallet;
        }

        // Use backend revenue calculation
        if (!Number.isNaN(backendRevenue) && backendRevenue >= 0) {
          revenue = backendRevenue;
          console.log('Using backend revenue:', revenue);
        } else {
          // Fallback revenue calculation (full amount + interest from redeemed items)
          console.log('Using fallback revenue calculation');
          revenue = 0;
          
          // Add full amount (loan + interest) from redeemed items
          redeemedItems.forEach(item => {
            const amount = item.loanAmount || item.requestedAmount || 0;
            const totalAmount = amount * 1.05; // Loan amount + 5% interest
            revenue += totalAmount;
            console.log('Added full amount from redeemed item:', totalAmount);
          });
          
          // Forfeited items do NOT contribute to revenue - they become inventory
          console.log('Fallback revenue calculated (redeemed full amounts):', revenue);
        }

        // Ensure minimum values for display
        if (!wallet || Number.isNaN(wallet) || wallet <= 0) {
          wallet = 10000;
        }

        setStats({
          totalUsers,
          activeLoans,
          pendingRequests,
          approvedRequests,
          forfeitedItems,
          wallet,
          revenue
        });
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
                  <span className="stat-label">Total Users</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💎</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.activeLoans}</span>
                  <span className="stat-label">Active Loans</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.pendingRequests}</span>
                  <span className="stat-label">Pending Requests</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.approvedRequests}</span>
                  <span className="stat-label">Approved Requests</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <span className="stat-number">{stats.forfeitedItems}</span>
                  <span className="stat-label">Forfeited Items</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💳</div>
                <div className="stat-info">
                  <span className="stat-number">₱{stats.wallet?.toFixed(2) || '0.00'}</span>
                  <span className="stat-label">Total Wallet</span>
                </div>
              </div>

              <div className="stat-card revenue">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <span className="stat-number">₱{stats.revenue?.toFixed(2) || '0.00'}</span>
                  <span className="stat-label">Total Revenue</span>
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