// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const persistAuthMetadata = (data) => {
  if (data.token) {
    sessionStorage.setItem('authToken', data.token);
  }
  if (data.role) {
    sessionStorage.setItem('userRole', data.role);
  }
  if (data.username) {
    sessionStorage.setItem('username', data.username);
  }
  if (data.email) {
    sessionStorage.setItem('email', data.email);
  }
};

const clearAuthMetadata = () => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('email');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred');
    error.status = response.status;
    error.data = data;
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

      persistAuthMetadata(data);

      return data;
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

      persistAuthMetadata(data);

      return data;
    },

    logout: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      // Clear stored auth metadata regardless of response
      clearAuthMetadata();

      if (response.ok) {
        return await handleResponse(response);
      }

      return { success: true, message: 'Logged out successfully' };
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
      const token = sessionStorage.getItem('authToken');
      return !!token;
    },

    // Get stored token
    getToken: () => {
      return sessionStorage.getItem('authToken');
    },

    getRole: () => {
      return sessionStorage.getItem('userRole');
    },

    getUsername: () => {
      return sessionStorage.getItem('username');
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

  admin: {
    getDashboardMetrics: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    }
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