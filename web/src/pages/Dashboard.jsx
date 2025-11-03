import { useState } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import '../styles/Dashboard.css';

function Dashboard() {
  const [userStats] = useState({
    activePawns: 3,
    loanAmount: 500,
    dueSoon: 1
  });

  const [notifications] = useState([
    {
      id: 1,
      message: 'Your pawn request PWN-002 has been appraised at ₱100. Loan Approved!',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      message: 'Loan PWN-001 due in 3 days. Please redeem or renew to avoid penalties.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 3,
      message: 'New vintage item added in thrift catalogue. Check them out!',
      time: '2 hours ago',
      unread: true
    }
  ]);

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-content">
        <Header />

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome back, user!</h2>
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
            <p className="stat-label">Loan Amount</p>
            <h3 className="stat-value">{userStats.loanAmount}</h3>
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
        <div className="alert-message">
          <p>You have 1 loan(s) due soon.</p>
          <a href="#" className="alert-link">View Details</a>
        </div>

        {/* Notifications Section */}
        <div className="notifications-section">
          <div className="section-header">
            <div className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <h2>Notifications</h2>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.map(notification => (
              <div key={notification.id} className="notification-item">
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{notification.time}</span>
                </div>
                {notification.unread && <span className="notification-dot"></span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
