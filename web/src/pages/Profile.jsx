import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import apiService from '../services/apiService';
import useNotify from '../hooks/useNotify';
import '../styles/Profile.css';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    id: null,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    role: '',
    createdAt: ''
  });

  const [formData, setFormData] = useState({ ...profile });
  const { notifySuccess, notifyError } = useNotify();

  // Fetch user profile when component mounts
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await apiService.auth.getProfile();
      setProfile(userProfile);
      setFormData(userProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      notifyError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updatedProfile = await apiService.auth.updateProfile(formData);
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
      notifySuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      notifyError('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  

  const openChangePassword = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setShowChangePassword(true);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const submitPassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill out all fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    
    try {
      setPasswordError('');
      await apiService.auth.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notifySuccess('Password changed successfully.');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-content">
          <div className="loading-spinner">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-content">
        <header className="profile-header">
          <h1>Profile</h1>
          <p>Manage your account information</p>
        </header>

        <div className="profile-container">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <button className="btn-upload">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Change Photo
              </button>
            </div>

            <div className="profile-info-section">
              <div className="profile-actions">
                {!isEditing ? (
                  <button className="btn-primary" onClick={() => setIsEditing(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button className="btn-primary" onClick={handleSave}>
                      Save Changes
                    </button>
                    <button className="btn-secondary" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-value">{profile.firstName}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    ) : (
                      <p className="form-value">{profile.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">{profile.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Username</label>
                  <p className="form-value">{profile.username}</p>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-value">{profile.phoneNumber || 'Not provided'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                    />
                  ) : (
                    <p className="form-value">{profile.address}</p>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <p className="form-value">{profile.role}</p>
                  </div>

                  <div className="form-group">
                    <label>Member Since</label>
                    <p className="form-value">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="settings-card">
            <h2>Account Settings</h2>
            
            <div className="settings-section">
              <h3>Security</h3>
              <button className="settings-button" onClick={openChangePassword}>
                <div className="settings-button-content">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <div>
                    <h4>Change Password</h4>
                    <p>Update your password regularly</p>
                  </div>
                </div>
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="settings-section">
              <h3>Preferences</h3>
              <button className="settings-button">
                <div className="settings-button-content">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <div>
                    <h4>Notification Settings</h4>
                    <p>Manage your notifications</p>
                  </div>
                </div>
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button className="settings-button">
                <div className="settings-button-content">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6" />
                    <path d="M1 12h6m6 0h6" />
                  </svg>
                  <div>
                    <h4>Display Settings</h4>
                    <p>Customize your experience</p>
                  </div>
                </div>
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChangePassword && (
        <div className="modal-backdrop" onClick={() => setShowChangePassword(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
              </div>
              {passwordError && <p className="error-text">{passwordError}</p>}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowChangePassword(false)}>Cancel</button>
              <button className="btn-primary" onClick={submitPassword}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
