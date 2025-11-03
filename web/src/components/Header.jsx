import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Lock, User } from 'lucide-react';
import useNotify from '../hooks/useNotify';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    next: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const { notifyInfo, notifySuccess, notifyError } = useNotify();
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

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

  const handleChangePassword = (e) => {
    e.preventDefault();
    const { current, next, confirm } = passwordData;
    
    if (!current || !next || !confirm) {
      setPasswordError('Please fill out all fields.');
      return;
    }
    
    if (next.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    
    if (next !== confirm) {
      setPasswordError('Passwords do not match.');
      return;
    }
    
    // Add your change password API call here
    // const response = await changePassword({ currentPassword: current, newPassword: next });
    
    // Mock success response
    setPasswordError('');
    setShowChangePasswordModal(false);
    setPasswordData({ current: '', next: '', confirm: '' });
    notifySuccess('Password changed successfully');
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
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
                <span>JD</span>
              </div>
              <span className="user-name">John Doe</span>
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
                  name="current" 
                  value={passwordData.current} 
                  onChange={handlePasswordChange} 
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  name="next" 
                  value={passwordData.next} 
                  onChange={handlePasswordChange} 
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirm" 
                  value={passwordData.confirm} 
                  onChange={handlePasswordChange} 
                />
              </div>
              {passwordError && <p className="error-text">{passwordError}</p>}
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
