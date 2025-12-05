import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import '../styles/AdminDashboard.css';

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
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-logo">
                        <span className="admin-shield">👥</span>
                        <h1>User Management</h1>
                    </div>
                </div>
                <button className="admin-logout-btn" onClick={handleBack}>
                    Back to Dashboard
                </button>
            </header>

            <main className="admin-main">
                <div className="admin-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>

                    <div className="admin-actions-bar">
                        <input
                            className="admin-search-input"
                            type="text"
                            placeholder="Search users by name, email, or username..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <div className="total-count">
                            Total Users: {filteredUsers.length}
                        </div>
                    </div>

                    <div className="admin-table-container">
                        {loading ? (
                            <div className="admin-loading" style={{ minHeight: '200px', background: 'white' }}>
                                <div className="loading-spinner"></div>
                                <p>Loading users...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="no-data-message" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                No users found.
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '5%' }}>ID</th>
                                        <th style={{ width: '20%' }}>User</th>
                                        <th style={{ width: '25%' }}>Email</th>
                                        <th style={{ width: '15%' }}>Role</th>
                                        <th style={{ width: '15%' }}>Status</th>
                                        <th style={{ width: '20%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td style={{ color: '#64748b' }}>#{user.id}</td>
                                            <td>
                                                <div className="user-cell">
                                                    <span className="user-name">{user.firstName} {user.lastName}</span>
                                                    <span className="user-id">@{user.username}</span>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`status-badge ${user.role === 'ADMIN' ? 'danger' : 'neutral'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.enabled ? 'success' : 'danger'}`}>
                                                    {user.enabled ? 'ACTIVE' : 'BANNED'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.role !== 'ADMIN' && (
                                                    <button
                                                        className={`admin-nav-button ${user.enabled ? 'danger-btn' : 'success-btn'}`}
                                                        style={{
                                                            padding: '6px 12px',
                                                            fontSize: '12px',
                                                            background: user.enabled ? '#fee2e2' : '#dcfce7',
                                                            color: user.enabled ? '#991b1b' : '#166534',
                                                            border: 'none',
                                                            width: 'auto',
                                                            display: 'inline-block'
                                                        }}
                                                        onClick={() => handleToggleStatus(user.id, user.enabled)}
                                                    >
                                                        {user.enabled ? 'BAN USER' : 'UNBAN USER'}
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
