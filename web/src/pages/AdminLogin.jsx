import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import useNotify from '../hooks/useNotify';
import '../styles/Auth.css';

function AdminLogin() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotify();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting admin login with:', formData);
      
      // Clear any existing tokens to allow new login without logging out first
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      const response = await apiService.auth.adminLogin(formData);
      console.log('Admin login response:', response);
      
      // Store admin token with a different key
      sessionStorage.setItem('adminToken', response.token);
      sessionStorage.setItem('adminUser', JSON.stringify({
        username: response.username,
        email: response.email,
        role: response.role
      }));
      
      // Also store in localStorage for backward compatibility
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify({
        username: response.username,
        email: response.email,
        role: response.role
      }));

      console.log('Stored admin data, navigating to dashboard');
      notifySuccess('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
      
      // Handle different error types
      if (error.data && error.data.message) {
        notifyError(error.data.message);
      } else if (error.message) {
        notifyError(error.message);
      } else if (error.status === 400) {
        notifyError('Invalid admin credentials or account type');
      } else if (error.status === 401) {
        notifyError('Invalid username or password');
      } else if (error.status === 500) {
        notifyError('Server error. Please try again later.');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        notifyError('Cannot connect to server. Please check if the backend is running.');
      } else {
        notifyError('Admin login failed. Please try again.');
      }
      setErrors({
        general: error.message || 'Admin login failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUserLogin = () => {
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-header-section">
        <div className="logo-container">
          <div className="logo-circle">
            <svg className="person-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h1 className="business-name">Thrift Shirt Pawnshop</h1>
          <p className="business-tagline">& Lending Service - Admin Portal</p>
        </div>
      </div>

      <div className="auth-content-section">
        <div className="auth-tabs">
          <div className="auth-tab active">
            Admin Login
          </div>
        </div>

        <div className="auth-form-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="usernameOrEmail">Admin Username or Email</label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                className={errors.usernameOrEmail ? 'error' : ''}
                placeholder="Enter admin username or email"
                disabled={loading}
                autoComplete="username"
              />
              {errors.usernameOrEmail && <span className="error-message">{errors.usernameOrEmail}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Admin Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter admin password"
                disabled={loading}
                autoComplete="current-password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {errors.general && (
              <div className="general-error">
                {errors.general}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
          
          <div className="auth-footer">


          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;