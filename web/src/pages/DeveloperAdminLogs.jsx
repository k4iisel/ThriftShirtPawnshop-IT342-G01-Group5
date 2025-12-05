import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import '../styles/AdminDashboard.css';

function DeveloperAdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();
    const { notifyError } = useNotify();

    useAuth('ADMIN');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const apiService = await import('../services/apiService');
            const response = await apiService.default.admin.getLogs();
            if (response.success && response.data) {
                setLogs(response.data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            notifyError('Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/dashboard');
    };

    const filteredLogs = logs.filter(log => {
        if (!filter) return true;
        const search = filter.toLowerCase();
        return (
            (log.action || '').toLowerCase().includes(search) ||
            (log.user?.username || '').toLowerCase().includes(search) ||
            (log.remarks || '').toLowerCase().includes(search)
        );
    });

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-logo">
                        <span className="admin-shield">📜</span>
                        <h1>Activity Logs</h1>
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
                            placeholder="Search logs by user, action, or remarks..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <div className="total-count">
                            Total Logs: {filteredLogs.length}
                        </div>
                    </div>

                    <div className="admin-table-container">
                        {loading ? (
                            <div className="admin-loading" style={{ minHeight: '200px', background: 'white' }}>
                                <div className="loading-spinner"></div>
                                <p>Loading activity logs...</p>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="no-data-message" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                No activity logs found.
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>Timestamp</th>
                                        <th style={{ width: '15%' }}>Action</th>
                                        <th style={{ width: '25%' }}>User</th>
                                        <th style={{ width: '40%' }}>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => {
                                        // Determine badge color
                                        const action = (log.action || 'UNKNOWN').toUpperCase();
                                        let badgeClass = 'status-badge neutral';
                                        if (action.includes('PAY') || action.includes('CREATE') || action.includes('APPROVE') || action.includes('REDEEM')) {
                                            badgeClass = 'status-badge success';
                                        } else if (action.includes('REJECT') || action.includes('FORFEIT') || action.includes('DEFAULT')) {
                                            badgeClass = 'status-badge danger';
                                        }

                                        return (
                                            <tr key={log.logId}>
                                                <td className="timestamp-cell">
                                                    {new Date(log.timestamp).toLocaleString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                                <td>
                                                    <span className={badgeClass}>
                                                        {log.action || 'UNKNOWN'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="user-cell">
                                                        <span className="user-name">{log.user ? log.user.username : 'System'}</span>
                                                        <span className="user-id">{log.user ? `ID: ${log.user.id}` : ''}</span>
                                                    </div>
                                                </td>
                                                <td style={{ color: '#475569' }}>
                                                    {log.remarks}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DeveloperAdminLogs;
