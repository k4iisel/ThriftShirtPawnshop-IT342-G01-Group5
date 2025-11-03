import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Lock, User } from 'lucide-react';
import useNotify from '../hooks/useNotify';
import apiService from '../services/apiService';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: ''
  });
  const { notifyInfo, notifySuccess, notifyError } = useNotify();
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (apiService.auth.isAuthenticated()) {
          const profile = await apiService.auth.getProfile();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // If token is invalid, redirect to login
        if (error.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Mock notifications - replace with real data from your API
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your pawn request has been approved', read: false, time: '2h ago' },
    { id: 2, message: 'New shirts available in the shop', read: false, time: '5h ago' },
  ]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notifyInfo('All notifications marked as read');
  };
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/browse') return 'Shirts Available';
    if (path === '/create') return 'Create Pawn';
    if (path === '/status') return 'Your Pawns';
    if (path === '/profile') return 'Profile';
    if (path === '/login') return 'Login';
    if (path === '/register') return 'Register';
    return '';
  };
  
  const pageTitle = getPageTitle();

  const handleLogout = () => {
    // Add your logout logic here (clear tokens, etc.)
    localStorage.removeItem('authToken'); // Example
    notifySuccess('Logged out successfully');
    navigate('/login');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      notifyError('Please fill out all fields.');
      return;
    }
    
    if (newPassword.length < 6) {
      notifyError('New password must be at least 6 characters.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      notifyError('Passwords do not match.');
      return;
    }
    
    try {
      await apiService.auth.changePassword({ currentPassword, newPassword, confirmPassword });
      setShowChangePasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notifySuccess('Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      notifyError(error.message || 'Failed to change password');
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    const firstName = userProfile.firstName || '';
    const lastName = userProfile.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (userProfile.username) {
      return userProfile.username.charAt(0).toUpperCase();
    }
    return 'U'; // Default initial
  };

  // Helper function to get display name
  const getDisplayName = () => {
    if (userProfile.firstName) {
      return userProfile.firstName;
    } else if (userProfile.username) {
      return userProfile.username;
    }
    return 'User';
  };
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <Link to="/dashboard" className="logo-link">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5l-2 2v11H5V10L3 8V3h5M9 3v3h6V3" />
              </svg>
            </div>
            <h1 className="page-title">{pageTitle}</h1>
          </Link>
        </div>
        
        <div className="header-actions">
          <div className="notification-wrapper" ref={notificationRef}>
            <button 
              className={`notification-button ${unreadCount > 0 ? 'has-unread' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button 
                    className="mark-all-read"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark all as read
                  </button>
                </div>
                
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => {
                          markAsRead(notification.id);
                          navigate('/notifications');
                        }}
                      >
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">{notification.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">No new notifications</div>
                  )}
                </div>
                
                <div className="notification-footer">
                  <Link to="/notifications" onClick={() => setShowNotifications(false)}>
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="user-menu-wrapper" ref={userMenuRef}>
            <div 
              className="user-menu"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                <span>{getUserInitials()}</span>
              </div>
              <span className="user-name">{getDisplayName()}</span>
              <ChevronDown size={16} className={`chevron ${showUserMenu ? 'rotated' : ''}`} />
            </div>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-item" onClick={() => navigate('/profile')}>
                  <User size={16} />
                  <span>Profile</span>
                </div>
                <div 
                  className="user-dropdown-item"
                  onClick={() => {
                    setShowChangePasswordModal(true);
                    setShowUserMenu(false);
                  }}
                >
                  <Lock size={16} />
                  <span>Change Password</span>
                </div>
                <div className="user-dropdown-divider"></div>
                <div 
                  className="user-dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="modal-backdrop" onClick={() => setShowChangePasswordModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword} className="modal-body">
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={passwordData.currentPassword} 
                  onChange={handlePasswordChange} 
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwordData.newPassword} 
                  onChange={handlePasswordChange} 
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwordData.confirmPassword} 
                  onChange={handlePasswordChange} 
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn-secondary" 
                  onClick={() => setShowChangePasswordModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
