import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import { formatRoleName, getRoleBadgeClass } from '../utils/roleUtils';
import logo from '../assets/images/logo.png';
import '../styles/DeveloperAdmin.css';

function DeveloperAdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();
    const { notifySuccess, notifyError } = useNotify();

    // Use admin authentication check
    useAuth('ADMIN');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const apiService = await import('../services/apiService');
            const response = await apiService.default.admin.getAllUsers();
            if (response.success && response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            notifyError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/dashboard');
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const action = currentStatus ? "Ban" : "Unban";
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        try {
            const apiService = await import('../services/apiService');
            const response = await apiService.default.admin.toggleUserStatus(userId);
            if (response.success) {
                notifySuccess(`User ${action.toLowerCase()}ned successfully`);
                // Update local state
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, enabled: !currentStatus } : user
                ));
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
            notifyError(`Failed to ${action.toLowerCase()} user`);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('WARNING: Are you sure you want to PERMANENTLY DELETE this user? This will also delete all their pawn requests and logs. This action cannot be undone.')) {
            return;
        }

        try {
            const apiService = await import('../services/apiService');
            await apiService.default.admin.deleteUser(userId);
            notifySuccess('User deleted successfully');
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            notifyError('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user => {
        if (!filter) return true;
        const search = filter.toLowerCase();
        return (
            (user.username || '').toLowerCase().includes(search) ||
            (user.email || '').toLowerCase().includes(search) ||
            (user.firstName || '').toLowerCase().includes(search) ||
            (user.lastName || '').toLowerCase().includes(search)
        );
    });

    return (
        <div className="dev-admin-page">
            <header className="dev-admin-header">
                <div className="dev-admin-header-left">
                    <div className="dev-admin-logo">
                        <img src={logo} alt="Logo" className="dev-admin-logo-img" />
                        <h1 className="dev-admin-title">Users</h1>
                    </div>
                </div>
                <button className="dev-admin-back-btn" onClick={handleBack}>
                    ← Back
                </button>
            </header>

            <main className="dev-admin-main">
                <div className="dev-admin-content">
                    <div className="dev-admin-toolbar">
                        <div className="dev-admin-filters">
                            <input
                                className="dev-admin-search"
                                type="text"
                                placeholder="Search users..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                        <div className="dev-admin-count">
                            {filteredUsers.length} users
                        </div>
                    </div>

                    <div className="dev-admin-table-container">
                        {loading ? (
                            <div className="dev-admin-loading">
                                <div className="dev-admin-loading-spinner"></div>
                                <div className="dev-admin-loading-text">Loading users...</div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="dev-admin-empty">
                                No users found.
                            </div>
                        ) : (
                            <table className="dev-admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="dev-admin-user-info">
                                                    <div className="dev-admin-user-name">{user.firstName} {user.lastName}</div>
                                                    <div className="dev-admin-user-username">@{user.username}</div>
                                                </div>
                                            </td>
                                            <td className="dev-admin-user-email">{user.email}</td>
                                            <td>
                                                <span className="dev-admin-role">
                                                    {formatRoleName(user.role)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`dev-admin-status ${user.enabled ? 'active' : 'inactive'}`}>
                                                    {user.enabled ? 'Active' : 'Banned'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.role !== 'ADMIN' && (
                                                    <button
                                                        className={`dev-admin-btn ${user.enabled ? 'danger' : 'success'}`}
                                                        onClick={() => handleToggleStatus(user.id, user.enabled)}
                                                    >
                                                        {user.enabled ? 'Ban' : 'Unban'}
                                                    </button>
                                                )}
                                                {user.role !== 'ADMIN' && (
                                                    <button
                                                        className="dev-admin-btn delete"
                                                        onClick={() => handleDelete(user.id)}
                                                        style={{ marginLeft: '8px', backgroundColor: '#dc2626', color: 'white' }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DeveloperAdminUsers;
