// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Use sessionStorage exclusively to prevent persistence across sessions
  const token = sessionStorage.getItem('authToken') || sessionStorage.getItem('adminToken');
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

  // Store user object if present (from main branch logic)
  if (data.user) {
    sessionStorage.setItem('user', JSON.stringify(data.user));
  }
};

const clearAuthMetadata = () => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('email');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');
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
      clearAuthMetadata();
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

      persistAuthMetadata(data);

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
      if (data.token) {
        persistAuthMetadata(data);
      }

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

      // Clear any existing user session to prevent conflicts
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('user');

      // Store admin token if present
      if (data.token) {
        sessionStorage.setItem('adminToken', data.token);
      }
      if (data.user) {
        sessionStorage.setItem('adminUser', JSON.stringify(data.user));
      }

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

    adminLogout: async () => {
      const adminToken = sessionStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken && { Authorization: `Bearer ${adminToken}` })
        },
      });

      clearAuthMetadata();

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

    getUserStats: async () => {
      const response = await fetch(`${API_BASE_URL}/user/stats`, {
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

    getWalletBalance: async () => {
      const response = await fetch(`${API_BASE_URL}/user/wallet/balance`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

    // Check if user has active session (for admin access prevention)
    checkUserSession: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/check-user-session`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },

    // Check if admin access is allowed
    checkAdminAccess: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/admin/access-check`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
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
    },

    getDashboardStats: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

    getInventory: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/inventory`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },

    getLogs: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/logs`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },

    getAllUsers: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },

    toggleUserStatus: async (userId) => {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },

    addCashToUser: async (userId, amount, reason) => {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/add-cash`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, reason }),
      });
      return await handleResponse(response);
    },

    removeCashFromUser: async (userId, amount, reason) => {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/remove-cash`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, reason }),
      });
      return await handleResponse(response);
    },

    createDefaultAccount: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/create-default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await handleResponse(response);
    },

    getAllPawnRequests: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/pawn-requests`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },

    updatePawnStatus: async (pawnId, status) => {
      const response = await fetch(`${API_BASE_URL}/admin/pawn-requests/${pawnId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return await handleResponse(response);
    },

    validatePawn: async (pawnId, interestRate = 5, daysUntilDue = 30) => {
      const url = new URL(`${API_BASE_URL}/admin/pawn-requests/${pawnId}/validate`);
      url.searchParams.append('interestRate', interestRate);
      url.searchParams.append('daysUntilDue', daysUntilDue);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },

    getActiveLoans: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/loans/active`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },

    processLoanPayment: async (loanId) => {
      const response = await fetch(`${API_BASE_URL}/admin/loans/${loanId}/payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },

    forfeitLoan: async (loanId) => {
      const response = await fetch(`${API_BASE_URL}/admin/loans/${loanId}/forfeit`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    },
  },

  // Pawn Request endpoints
  pawnRequest: {
    create: async (pawnData) => {
      const response = await fetch(`${API_BASE_URL}/user/pawn-requests`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(pawnData),
      });

      return await handleResponse(response);
    },

    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/user/pawn-requests`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

    delete: async (pawnId) => {
      const response = await fetch(`${API_BASE_URL}/user/pawn-requests/${pawnId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },
  },

  // User Loan endpoints
  loan: {
    getUserLoans: async () => {
      const response = await fetch(`${API_BASE_URL}/user/loans`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

    getTransactionHistory: async () => {
      const response = await fetch(`${API_BASE_URL}/user/transaction-history`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

    redeem: async (loanId) => {
      const response = await fetch(`${API_BASE_URL}/user/loans/${loanId}/redeem`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

    renew: async (loanId) => {
      const response = await fetch(`${API_BASE_URL}/user/loans/${loanId}/renew`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

    deleteTransaction: async (logId) => {
      const response = await fetch(`${API_BASE_URL}/user/transaction-history/${logId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

    clearTransactionHistory: async () => {
      const response = await fetch(`${API_BASE_URL}/user/transaction-history`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

    // Wallet Management
    cashIn: async (amount) => {
      const response = await fetch(`${API_BASE_URL}/user/wallet/cash-in?amount=${amount}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

    cashOut: async (amount) => {
      const response = await fetch(`${API_BASE_URL}/user/wallet/cash-out?amount=${amount}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    },

  },

  // File Upload
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        // Content-Type header must NOT be set manually for FormData, browser sets it with boundary
        ...(apiService.auth.getToken() && { Authorization: `Bearer ${apiService.auth.getToken()}` })
      },
      body: formData,
    });
    return await handleResponse(response);
  },

  // Add more service endpoints here as needed (transactions, etc.)

  // User endpoints
  user: {
    getWalletBalance: async () => {
      const response = await fetch(`${API_BASE_URL}/user/wallet/balance`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    }
  },

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