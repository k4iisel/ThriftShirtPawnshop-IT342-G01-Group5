// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Try sessionStorage first, then fallback to localStorage for backward compatibility
  const token = sessionStorage.getItem('authToken') || sessionStorage.getItem('adminToken') || 
                localStorage.getItem('authToken') || localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred');
    error.status = response.status;
    error.data = data;
    
    // If unauthorized (401) or forbidden (403), clear tokens
    if (response.status === 401 || response.status === 403) {
      // Clear all tokens to allow re-login
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
    
    throw error;
  }
  
  return data;
};

// API Service
export const apiService = {
  // Authentication endpoints
  auth: {
    login: async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await handleResponse(response);
      
      // Store token in sessionStorage
      if (data.token) {
        sessionStorage.setItem('authToken', data.token);
        // Also store in localStorage for backward compatibility
        localStorage.setItem('authToken', data.token);
        
        // Store user data if available
        if (data.user) {
          sessionStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
      
      return data;
    },
    
    validateToken: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },

    register: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await handleResponse(response);
      
      // Registration no longer auto-logs in, so no token is returned
      // User must login separately after registration
      
      return data;
    },

    adminLogin: async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await handleResponse(response);
      
      // Don't store token here - let the component handle it
      return data;
    },

    logout: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        return await handleResponse(response);
      }
      
      return { success: true, message: 'Logged out successfully' };
    },

    adminLogout: async () => {
      const adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken && { Authorization: `Bearer ${adminToken}` })
        },
      });
      
      if (response.ok) {
        return await handleResponse(response);
      }
      
      return { success: true, message: 'Admin logged out successfully' };
    },

    getProfile: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      return await handleResponse(response);
    },

    updateProfile: async (profileData) => {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      
      return await handleResponse(response);
    },

    changePassword: async (passwordData) => {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });
      
      return await handleResponse(response);
    },

    // Check if user is authenticated
    isAuthenticated: () => {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      return !!token;
    },

    // Get stored token
    getToken: () => {
      return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    },

    // Health check
    health: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await handleResponse(response);
    }
  },

  // Admin endpoints
  admin: {
    createDefaultAccount: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/create-default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    },
  },

  // Add more service endpoints here as needed (pawn items, transactions, etc.)
  
  // Generic API call method
  call: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: getAuthHeaders(),
      ...options,
    };
    
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    
    const response = await fetch(url, config);
    return await handleResponse(response);
  }
};

export default apiService;