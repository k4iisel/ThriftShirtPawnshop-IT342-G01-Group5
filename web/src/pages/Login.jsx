import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { notifySuccess, notifyError } = useNotify();

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
        const response = await apiService.auth.login({
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password
        });

        // Extract token: support a few common shapes to be safe
        const token =
          response?.data?.token ||
          response?.data?.accessToken ||
          response?.token ||
          response?.accessToken ||
          response?.data?.access_token ||
          response?.access_token;

        if (!token) {
          // If the auth API returned a wrapper (like { data: { token: … } }), we might still be covered above
          throw new Error('Login succeeded but token missing from server response.');
        }

        // Store token: localStorage if rememberMe true, otherwise sessionStorage
        if (formData.rememberMe) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }

        // Optional: store the username to show in UI later
        if (formData.rememberMe) {
          localStorage.setItem('rememberedUsername', formData.usernameOrEmail);
        } else {
          sessionStorage.removeItem('rememberedUsername');
        }

        notifySuccess('Login successful! Welcome back.');
        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        if (error.status === 401 || (error.response && error.response.status === 401)) {
          notifyError('Invalid username/email or password');
        } else if (error.data?.data) {
          // Handle validation errors returned from server
          setErrors(error.data.data);
        } else {
          notifyError(error.message || 'Login failed. Please try again.');
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
