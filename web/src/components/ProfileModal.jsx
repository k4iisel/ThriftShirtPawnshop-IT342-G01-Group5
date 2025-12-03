import { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import useNotify from '../hooks/useNotify';
import '../styles/ProfileModal.css';

function ProfileModal({ isOpen, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    id: null,
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    createdAt: ''
  });

  const [formData, setFormData] = useState({ ...profile });
  const { notifySuccess, notifyError } = useNotify();

  // Fetch user profile when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

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

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-backdrop" onClick={handleClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>Profile</h2>
          <button className="profile-modal-close" onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="profile-modal-loading">
            <div className="loading-spinner">Loading...</div>
          </div>
        ) : (
          <div className="profile-modal-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>{profile.firstName} {profile.lastName}</h3>
              <p className="profile-role">{profile.role}</p>
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
                <label>Email</label>
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
                <label>Member Since</label>
                <p className="form-value">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  }) : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="profile-modal-actions">
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
                  <button className="btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSave}>
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;