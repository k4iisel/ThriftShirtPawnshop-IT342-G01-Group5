import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import logo from '../assets/images/logo.png';
import '../styles/DeveloperAdminLogs.css';

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
        <div className="logs-page">
            <header className="logs-header">
                <div className="logs-header-left">
                    <div className="logs-logo">
                        <img src={logo} alt="Logo" className="logs-logo-img" />
                        <h1 className="logs-title">Activity Logs</h1>
                    </div>
                </div>
                <button className="logs-back-btn" onClick={handleBack}>
                    ← Back
                </button>
            </header>

            <main className="logs-main">
                <div className="logs-content">
                    <div className="logs-toolbar">
                        <input
                            className="logs-search"
                            type="text"
                            placeholder="Search logs by user, action, or remarks..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <div className="logs-count">
                            {filteredLogs.length} logs
                        </div>
                    </div>

                    <div className="logs-table-container">
                        {loading ? (
                            <div className="logs-loading">
                                <div className="logs-loading-spinner"></div>
                                <div className="logs-loading-text">Loading activity logs...</div>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="logs-empty">
                                No activity logs found.
                            </div>
                        ) : (
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>Action</th>
                                        <th>User</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => {
                                        // Determine badge color
                                        const action = (log.action || 'UNKNOWN').toUpperCase();
                                        let badgeClass = 'logs-action-badge neutral';
                                        if (action.includes('PAY') || action.includes('CREATE') || action.includes('APPROVE') || action.includes('REDEEM')) {
                                            badgeClass = 'logs-action-badge success';
                                        } else if (action.includes('REJECT') || action.includes('FORFEIT') || action.includes('DEFAULT')) {
                                            badgeClass = 'logs-action-badge danger';
                                        }

                                        return (
                                            <tr key={log.logId}>
                                                <td className="logs-timestamp">
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
                                                    <div className="logs-user-info">
                                                        <span className="logs-user-name">{log.user ? log.user.username : 'System'}</span>
                                                        <span className="logs-user-id">{log.user ? `ID: ${log.user.id}` : ''}</span>
                                                    </div>
                                                </td>
                                                <td className="logs-remarks">
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
