import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/apiService';
import useNotify from '../hooks/useNotify';
import '../styles/Auth.css';

function Login() {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { notifySuccess, notifyError } = useNotify();

  // Check for admin block error
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const error = searchParams.get('error');
    
    if (error === 'admin_blocked') {
      notifyError('Admin access blocked: Please login with your regular user account or contact administrator for admin access.');
      // Clean up the URL
      navigate('/login', { replace: true });
    }
  }, [location, navigate, notifyError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      try {
        // Clear any existing tokens to allow new login without logging out first
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');

        const response = await apiService.auth.login({
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password
        });

        // Check if we have user data in the response
        if (response.user) {
          // Store user data in session storage for immediate use
          sessionStorage.setItem('user', JSON.stringify(response.user));
          // REMOVED localStorage usage to prevent persistence

          // Personalized success message
          const userName = response.user.username || response.user.firstName || 'user';
          notifySuccess(`Login successful! Welcome back, ${userName}.`);
        } else {
          notifySuccess('Login successful! Welcome back.');
        }

        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);

        // Handle different error types
        if (error.data && error.data.message) {
          notifyError(error.data.message);
        } else if (error.data?.data) {
          // Handle validation errors
          setErrors(error.data.data);
        } else if (error.message) {
          notifyError(error.message);
        } else if (error.status === 400) {
          notifyError('Invalid credentials or account type');
        } else if (error.status === 401) {
          notifyError('Invalid username/email or password');
        } else if (error.status === 500) {
          notifyError('Server error. Please try again later.');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          notifyError('Cannot connect to server. Please check if the backend is running.');
        } else {
          notifyError('Login failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'register') {
      navigate('/register');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header-section">
        <div className="logo-container">
          <div className="logo-circle">
            <svg className="tshirt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 3h5v5l-2 2v11H5V10L3 8V3h5M9 3v3h6V3" />
            </svg>
          </div>
          <h1 className="business-name">Thrift Shirt Pawnshop</h1>
          <p className="business-tagline">& Lending Service</p>
        </div>
      </div>

      <div className="auth-content-section">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            Register
          </button>
        </div>

        <div className="auth-form-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="usernameOrEmail">Username or Email</label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                className={errors.usernameOrEmail ? 'error' : ''}
                autoComplete="username"
                placeholder="Enter your username or email"
              />
              {errors.usernameOrEmail && <span className="error-message">{errors.usernameOrEmail}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                autoComplete="current-password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
            </div>

            <a href="#" className="forgot-password-link">
              Forgot password?
            </a>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
