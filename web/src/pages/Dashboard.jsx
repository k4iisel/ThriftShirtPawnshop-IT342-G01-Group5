import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import ImageModal from '../components/ImageModal';
import CashTransactionModal from '../components/CashTransactionModal';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import apiService from '../services/apiService';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifyError } = useNotify();

  // Check for error parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const error = searchParams.get('error');

    console.log('📊 Dashboard - checking for error parameter:', {
      search: location.search,
      error: error,
      pathname: location.pathname
    });

    if (error === 'admin_access_denied') {
      console.log('🚫 Dashboard - displaying admin access denied error');
      notifyError('🚫 Admin Access Blocked: You cannot access admin areas while logged in as a regular user. Stay on user pages or logout to access admin.');
      // Clean up the URL after showing error
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [location, navigate, notifyError]);

  // Check if there's an admin token and clear it if we're on the dashboard
  // This prevents redirection loops for admins who try to access the dashboard
  useEffect(() => {
    const adminToken = sessionStorage.getItem('adminToken');
    if (adminToken) {
      // If we're on the dashboard and have an admin token, clear it to prevent redirection
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }

    // Validate user token on dashboard load
    const validateUserToken = async () => {
      try {
        const userToken = sessionStorage.getItem('authToken');
        if (userToken) {
          await apiService.auth.validateToken();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        // Clear all tokens to allow re-login
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    };

    validateUserToken();
  }, []);

  // Use the authentication hook
  useAuth('USER');

  // Get user data from storage
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const [userStats, setUserStats] = useState({
    activePawns: 0,
    loanAmount: 0,
    dueSoon: 0
  });

  const [recentPawnedItems, setRecentPawnedItems] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState('');
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashTransactionType, setCashTransactionType] = useState('');

  // Function to fetch recent activity (all statuses, sorted by most recent)
  const fetchRecentPawnedItems = async (force = false) => {
    try {
      // Check if activity is cleared (skip check if force is true)
      if (!force) {
        const isCleared = localStorage.getItem('recentActivityCleared') === 'true';
        if (isCleared) {
          setRecentPawnedItems([]);
          return;
        }
      }

      const response = await apiService.pawnRequest.getAll();
      
      if (response.success && response.data) {
        // Sort all items by most recent activity (createdAt or updatedAt)
        const sortedItems = response.data
          .sort((a, b) => {
            // Use updatedAt if available, otherwise use createdAt
            const aDate = new Date(a.updatedAt || a.createdAt);
            const bDate = new Date(b.updatedAt || b.createdAt);
            return bDate - aDate; // Most recent first
          })
          .slice(0, 10); // Show top 10 most recent items
        
        setRecentPawnedItems(sortedItems);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  // Function to clear recent activity
  const clearRecentActivity = () => {
    if (window.confirm('Are you sure you want to clear recent activity display? This will remain cleared even after refresh.')) {
      setRecentPawnedItems([]);
      localStorage.setItem('recentActivityCleared', 'true');
      notify.notifySuccess('Recent activity cleared');
    }
  };

  // Handle viewing images
  const handleViewImages = (pawn) => {
    let images = [];
    
    if (pawn.photos) {
      try {
        const photosData = JSON.parse(pawn.photos);
        if (Array.isArray(photosData)) {
          images = photosData;
        } else if (typeof photosData === 'string') {
          images = [photosData];
        }
      } catch (e) {
        images = [pawn.photos];
      }
    }
    
    if (images.length === 0) {
      images = [`https://via.placeholder.com/400x400?text=${encodeURIComponent(pawn.itemName)}`];
    }
    
    setSelectedImages(images);
    setSelectedItemName(pawn.itemName);
    setShowImageModal(true);
  };

  // Load recent pawned items on component mount
  useEffect(() => {
    fetchRecentPawnedItems();
  }, []);

  // Refresh stats periodically to catch new pawned items
  useEffect(() => {
    const interval = setInterval(() => {
      if (userData) {
        // Re-fetch stats to update wallet balance and active pawns count
        const fetchStats = async () => {
          try {
            const walletResponse = await apiService.user.getWalletBalance();
            const actualWalletBalance = walletResponse.success && walletResponse.data?.balance 
              ? parseFloat(walletResponse.data.balance) 
              : 0;
            
            const response = await apiService.pawnRequest.getAll();
            
            if (response.success && response.data) {
              const pawnedItems = response.data.filter(pawn => pawn.status === 'PAWNED');
              const activePawnCount = pawnedItems.length;
              
              const dueSoonCount = pawnedItems.filter(pawn => {
                if (pawn.loan && pawn.loan.dueDate) {
                  const dueDate = new Date(pawn.loan.dueDate);
                  const today = new Date();
                  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                  return daysUntilDue <= 7 && daysUntilDue >= 0;
                }
                return false;
              }).length;
              
              setUserStats({
                activePawns: activePawnCount,
                loanAmount: actualWalletBalance,
                dueSoon: dueSoonCount
              });
              
              fetchRecentPawnedItems();
            }
          } catch (error) {
            console.error('Error refreshing stats:', error);
          }
        };
        fetchStats();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [userData]);



  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch wallet balance from backend database
        const walletResponse = await apiService.user.getWalletBalance();
        const actualWalletBalance = walletResponse.success && walletResponse.data?.balance 
          ? parseFloat(walletResponse.data.balance) 
          : 0;
        
        // Fetch all pawn requests (same as PawnStatus)
        const response = await apiService.pawnRequest.getAll();
        
        if (response.success && response.data) {
          // Filter for PAWNED status items
          const pawnedItems = response.data.filter(pawn => pawn.status === 'PAWNED');
          
          // Count active pawned items
          const activePawnCount = pawnedItems.length;
          
          // Count items due soon (within 7 days of due date)
          const dueSoonCount = pawnedItems.filter(pawn => {
            if (pawn.loan && pawn.loan.dueDate) {
              const dueDate = new Date(pawn.loan.dueDate);
              const today = new Date();
              const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
              return daysUntilDue <= 7 && daysUntilDue >= 0;
            }
            return false;
          }).length;
          
          setUserStats({
            activePawns: activePawnCount,
            loanAmount: actualWalletBalance,
            dueSoon: dueSoonCount
          });
          
          // Refresh recent pawned items
          fetchRecentPawnedItems();
        } else {
          // If no pawn requests, still show wallet balance
          setUserStats(prev => ({
            ...prev,
            loanAmount: actualWalletBalance
          }));
        }
      } catch (error) {
        console.error('❌ Dashboard: Error fetching user stats:', error);
      }
    };

    fetchStats();
  }, [userData]);



  // Refresh recent pawned items
  const [refreshing, setRefreshing] = useState(false);
  
  const refreshRecentPawns = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    
    try {
      // Clear the cleared flag to allow fetching new data
      localStorage.removeItem('recentActivityCleared');
      // Force fetch even if cleared flag was set
      await fetchRecentPawnedItems(true);
    } catch (error) {
      console.error('Error refreshing recent pawns:', error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-content">
        <Header />

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome back, {userData?.username || userData?.firstName || 'user'}!</h2>
          <p>Here's what's happening with your account</p>
        </div>

        {/* Stats Cards */}
        <div className="user-stats-grid">
          <div className="user-stat-card">
            <div className="stat-icon-box" style={{ color: '#e67e22' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <p className="stat-label">Active Pawns</p>
            <h3 className="stat-value">{userStats.activePawns}</h3>
          </div>

          <div className="user-stat-card wallet-card">
            <div className="stat-icon-box" style={{ color: '#4caf50' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <p className="stat-label">Wallet</p>
            <h3 className="stat-value">₱{userStats.loanAmount?.toFixed(2)}</h3>
            <div className="wallet-actions">
              <button className="cash-in-btn" onClick={() => { setCashTransactionType('Cash In'); setShowCashModal(true); }}>
                Cash In
              </button>
              <button className="cash-out-btn" onClick={() => { setCashTransactionType('Cash Out'); setShowCashModal(true); }}>
                Cash Out
              </button>
            </div>
          </div>

          <div className="user-stat-card">
            <div className="stat-icon-box" style={{ color: '#ff5722' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="stat-label">Due Soon</p>
            <h3 className="stat-value">{userStats.dueSoon}</h3>
          </div>
        </div>

        {/* Alert Message */}
        {userStats.dueSoon > 0 && (
          <div className="alert-message">
            <p>You have {userStats.dueSoon} loan(s) due soon.</p>
            <a href="#" onClick={() => {
              navigate('/history');
            }} className="alert-link">View Details</a>
          </div>
        )}

        {/* Recent Activity Section */}
        <div className="activity-logs-section">
          <div className="section-header">
            <div className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2>Recent Activity</h2>
            </div>
            <div className="activity-logs-actions">
              <button 
                className="clear-activity-btn"
                onClick={clearRecentActivity}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="activity-logs-list">
            {recentPawnedItems.length > 0 ? (
              recentPawnedItems.map(pawn => {
                const getStatusInfo = (status) => {
                  switch(status) {
                    case 'PENDING':
                      return { class: 'log-info', label: 'Pending Review' };
                    case 'APPROVED':
                      return { class: 'log-success', label: 'Approved' };
                    case 'REJECTED':
                      return { class: 'log-error', label: 'Rejected' };
                    case 'PAWNED':
                      return { class: 'log-success', label: 'Active Pawn' };
                    case 'REDEEMED':
                      return { class: 'log-info', label: 'Redeemed' };
                    case 'FORFEITED':
                      return { class: 'log-warning', label: 'Forfeited' };
                    default:
                      return { class: 'log-info', label: status };
                  }
                };

                const statusInfo = getStatusInfo(pawn.status);
                
                // Get valid date from updatedAt or createdAt
                let activityDate;
                try {
                  activityDate = new Date(pawn.updatedAt || pawn.createdAt);
                  // Check if date is valid
                  if (isNaN(activityDate.getTime())) {
                    activityDate = new Date(); // fallback to current date
                  }
                } catch (e) {
                  activityDate = new Date(); // fallback to current date
                }
                
                // Format date based on whether it's today or not
                const formatDateTime = (date) => {
                  try {
                    const today = new Date();
                    const isToday = date.toDateString() === today.toDateString();
                    
                    if (isToday) {
                      // Show only time for today's activities
                      return date.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                    } else {
                      // Show date and time for older activities
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    }
                  } catch (e) {
                    return 'Recent';
                  }
                };
                
                return (
                  <div 
                    key={pawn.id} 
                    className={`activity-log-item ${statusInfo.class}`}
                  >
                    <div className={`log-icon log-icon-${statusInfo.class.replace('log-', '')}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="log-content">
                      <p className="log-action">
                        {pawn.itemName}
                        <span className={`status-badge status-${pawn.status.toLowerCase()}`}>
                          {statusInfo.label}
                        </span>
                      </p>
                      <p className="log-details">
                        ₱{parseFloat(pawn.loanAmount || pawn.requestedAmount || 0).toFixed(2)}
                      </p>
                      <p className="log-time">{formatDateTime(activityDate)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-logs">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <ImageModal
            images={selectedImages}
            itemName={selectedItemName}
            onClose={() => setShowImageModal(false)}
          />
        )}

        {/* Cash Transaction Modal */}
        <CashTransactionModal
          isOpen={showCashModal}
          onClose={() => setShowCashModal(false)}
          transactionType={cashTransactionType}
        />
      </div>
    </div>
  );
}

export default Dashboard;
