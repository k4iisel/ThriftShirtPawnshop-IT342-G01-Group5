import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import ImageModal from '../components/ImageModal';
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

  // Function to fetch recent pawned items with due date prioritization
  const fetchRecentPawnedItems = async () => {
    try {
      const response = await apiService.loan.getUserLoans();
      
      if (response.success && response.data) {
        // Filter for PAWNED status items
        const pawnedItems = response.data.filter(pawn => pawn.status === 'PAWNED');
        
        // Sort by due date priority: due items first, then by most recent
        const sortedItems = pawnedItems.sort((a, b) => {
          const today = new Date();
          const aHasDue = a.loan && a.loan.dueDate;
          const bHasDue = b.loan && b.loan.dueDate;
          
          if (aHasDue && bHasDue) {
            const aDueDate = new Date(a.loan.dueDate);
            const bDueDate = new Date(b.loan.dueDate);
            const aDaysUntilDue = Math.ceil((aDueDate - today) / (1000 * 60 * 60 * 24));
            const bDaysUntilDue = Math.ceil((bDueDate - today) / (1000 * 60 * 60 * 24));
            
            // If both are due or overdue (≤ 0), show most overdue first
            if (aDaysUntilDue <= 0 && bDaysUntilDue <= 0) {
              return aDaysUntilDue - bDaysUntilDue;
            }
            // If both are due soon (≤ 7), show soonest first
            if (aDaysUntilDue <= 7 && bDaysUntilDue <= 7) {
              return aDaysUntilDue - bDaysUntilDue;
            }
            // Prioritize due items over non-due items
            if (aDaysUntilDue <= 7 && bDaysUntilDue > 7) return -1;
            if (bDaysUntilDue <= 7 && aDaysUntilDue > 7) return 1;
          }
          
          // If only one has due date, prioritize it
          if (aHasDue && !bHasDue) {
            const aDueDate = new Date(a.loan.dueDate);
            const aDaysUntilDue = Math.ceil((aDueDate - today) / (1000 * 60 * 60 * 24));
            return aDaysUntilDue <= 7 ? -1 : 1;
          }
          if (bHasDue && !aHasDue) {
            const bDueDate = new Date(b.loan.dueDate);
            const bDaysUntilDue = Math.ceil((bDueDate - today) / (1000 * 60 * 60 * 24));
            return bDaysUntilDue <= 7 ? 1 : -1;
          }
          
          // If neither has due date, sort by most recent
          return new Date(b.createdAt) - new Date(a.createdAt);
        }).slice(0, 10); // Show top 10 items
        
        setRecentPawnedItems(sortedItems);
      }
    } catch (error) {
      console.error('Error fetching recent pawned items:', error);
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



  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('📊 Dashboard: Fetching user loans...');
        // Fetch active loans for the user
        const response = await apiService.loan.getUserLoans();
        
        console.log('📊 Dashboard: Loans response received:', response);
        
        if (response.success && response.data) {
          console.log('📊 Dashboard: Total loans fetched:', response.data.length);
          console.log('📊 Dashboard: All loans:', response.data);
          
          // Filter for PAWNED status items (the API returns pawn requests, not loans)
          const pawnedItems = response.data.filter(pawn => {
            console.log(`📊 Dashboard: Checking pawn - Status: "${pawn.status}" (type: ${typeof pawn.status}), Item: ${pawn.itemName}`);
            return pawn.status === 'PAWNED';
          });
          
          console.log('📊 Dashboard: Pawned items count:', pawnedItems.length);
          console.log('📊 Dashboard: Pawned items:', pawnedItems);
          
          // Count active pawned items
          const activePawnCount = pawnedItems.length;
          
          // Calculate total loan amount from pawned items (use requestedAmount since these are pawn requests)
          const totalLoanAmount = pawnedItems.reduce((sum, pawn) => {
            return sum + (parseFloat(pawn.requestedAmount) || 0);
          }, 0);
          
          // Count items due soon (within 7 days of due date)
          const dueSoonCount = pawnedItems.filter(pawn => {
            if (pawn.loan && pawn.loan.dueDate) {
              const dueDate = new Date(pawn.loan.dueDate);
              const today = new Date();
              const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
              return daysUntilDue <= 7 && daysUntilDue >= 0;
            }
            // If no due date available, check if item was created more than 23 days ago (assuming 30-day loan period)
            if (pawn.createdAt) {
              const createdDate = new Date(pawn.createdAt);
              const today = new Date();
              const daysSinceCreated = Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24));
              return daysSinceCreated >= 23; // Due soon if created 23+ days ago (7 days before 30-day limit)
            }
            return false;
          }).length;
          
          console.log('📊 Dashboard: Final stats - Active:', activePawnCount, 'Amount:', totalLoanAmount, 'Due Soon:', dueSoonCount);
          
          setUserStats({
            activePawns: activePawnCount,
            loanAmount: totalLoanAmount,
            dueSoon: dueSoonCount
          });
          
          // Refresh recent pawned items
          fetchRecentPawnedItems();
        } else {
          console.warn('📊 Dashboard: Response not successful or no data');
        }
      } catch (error) {
        console.error('❌ Dashboard: Error fetching user stats:', error);
      }
    };

    // Fetch stats on component mount and whenever userData changes
    console.log('📊 Dashboard: Attempting to fetch stats, userData:', userData);
    fetchStats();
  }, [userData]);



  // Refresh recent pawned items
  const [refreshing, setRefreshing] = useState(false);
  
  const refreshRecentPawns = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    
    try {
      await fetchRecentPawnedItems();
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

          <div className="user-stat-card">
            <div className="stat-icon-box" style={{ color: '#4caf50' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <p className="stat-label">Wallet</p>
            <h3 className="stat-value">₱{userStats.loanAmount?.toFixed(2)}</h3>
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

        {/* Recent Pawned Items Section */}
        <div className="activity-logs-section">
          <div className="section-header">
            <div className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <h2>Recent Pawned</h2>
            </div>
            <div className="activity-logs-actions">
              <button 
                className="clear-activity-btn"
                onClick={refreshRecentPawns}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="activity-logs-list">
            {recentPawnedItems.length > 0 ? (
              recentPawnedItems.map(pawn => {
                const today = new Date();
                const hasDueDate = pawn.loan && pawn.loan.dueDate;
                const isDue = hasDueDate && new Date(pawn.loan.dueDate) <= today;
                const isDueSoon = hasDueDate && !isDue && Math.ceil((new Date(pawn.loan.dueDate) - today) / (1000 * 60 * 60 * 24)) <= 7;
                
                return (
                  <div 
                    key={pawn.id} 
                    className={`activity-log-item ${isDue ? 'log-error' : isDueSoon ? 'log-warning' : 'log-success'} clickable-pawn`}
                    onClick={() => navigate('/status')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`log-icon ${isDue ? 'log-icon-error' : isDueSoon ? 'log-icon-warning' : 'log-icon-success'}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      </svg>
                    </div>
                    <div className="log-content">
                      <p className="log-action">{pawn.itemName}</p>
                      <p className="log-details">
                        Amount: ₱{parseFloat(pawn.requestedAmount).toFixed(2)}
                        {hasDueDate && (
                          <> • Due: {new Date(pawn.loan.dueDate).toLocaleDateString()}
                          {isDue && <span className="due-status overdue"> (OVERDUE)</span>}
                          {isDueSoon && <span className="due-status due-soon"> (DUE SOON)</span>}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-logs">
                <p>No recent pawned items</p>
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
      </div>
    </div>
  );
}

export default Dashboard;
