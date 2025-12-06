// Utility functions for role handling

/**
 * Formats a role string to a user-friendly display name
 * @param {string} role - The role string (USER, ADMIN, EMPLOYEE)
 * @returns {string} - Formatted role name
 */
export const formatRoleName = (role) => {
  if (!role) return 'Unknown';
  
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return 'Administrator';
    case 'EMPLOYEE':
      return 'Employee';
    case 'USER':
      return 'Customer';
    default:
      return role;
  }
};

/**
 * Gets the appropriate CSS class for a role badge
 * @param {string} role - The role string (USER, ADMIN, EMPLOYEE)
 * @returns {string} - CSS class name
 */
export const getRoleBadgeClass = (role) => {
  if (!role) return 'neutral';
  
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return 'danger';
    case 'EMPLOYEE':
      return 'warning';
    case 'USER':
      return 'neutral';
    default:
      return 'neutral';
  }
};