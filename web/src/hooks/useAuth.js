import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotify from './useNotify';
import apiService from '../services/apiService';

export const useAuth = (requiredRole = 'USER') => {
  const navigate = useNavigate();
  const { notifyError } = useNotify();

  useEffect(() => {
    const validateAuthentication = async () => {
      try {
        if (requiredRole === 'ADMIN') {
          // Admin authentication
          const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
          const adminUserData = sessionStorage.getItem('adminUser') || localStorage.getItem('adminUser');

          if (!adminToken || !adminUserData) {
            notifyError('Access denied. Please login as admin.');
            navigate('/admin/login');
            return;
          }

          const userData = JSON.parse(adminUserData);
          if (userData.role !== 'ADMIN') {
            notifyError('Access denied. Admin privileges required.');
            navigate('/admin/login');
            return;
          }

          // Validate admin token with backend
          try {
            await apiService.auth.checkAdminAccess();
          } catch (error) {
            console.error('Admin validation failed:', error);
            throw new Error('Admin session invalid');
          }
        } else {
          // User authentication
          const userToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
          const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
          const adminUser = sessionStorage.getItem('adminUser') || localStorage.getItem('adminUser');

          // Only redirect admin users if they're trying to access user-specific pages
          // This check should not happen on the login page or dashboard to prevent redirection loops
          // and to allow normal user login flow
          const excludedPaths = ['/login', '/dashboard'];
          if (!excludedPaths.includes(window.location.pathname) && adminToken && adminUser) {
            try {
              const userData = JSON.parse(adminUser);
              if (userData.role === 'ADMIN') {
                notifyError('Admin accounts cannot access user pages. Redirecting to admin portal.');
                navigate('/admin/dashboard');
                return;
              }
            } catch (error) {
              console.error('Error parsing admin user data:', error);
            }
          }

          // If no user token, redirect to login
          if (!userToken) {
            notifyError('Please login to access this page.');
            navigate('/login');
            return;
          }

          // Validate token with backend
          try {
            await apiService.auth.validateToken();
          } catch (validationError) {
            console.error('Token validation failed:', validationError);
            // Clear invalid tokens and redirect to login
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            notifyError('Your session has expired. Please login again.');
            navigate('/login');
            return;
          }
        }
      } catch (error) {
        console.error('Authentication validation failed:', error);

        if (requiredRole === 'ADMIN') {
          // Clear invalid admin tokens
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminUser');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          notifyError('Admin session expired. Please login again.');
          navigate('/admin/login');
        } else {
          // Clear invalid user tokens
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          notifyError('Session expired. Please login again.');
          navigate('/login');
        }
      }
    };

    validateAuthentication();
  }, [navigate, notifyError, requiredRole]);
};

export default useAuth;