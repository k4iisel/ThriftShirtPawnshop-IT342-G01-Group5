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
            log.action.toLowerCase().includes(search) ||
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
                    <div className="admin-actions-bar" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '300px' }}
                            />
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                            Total Logs: {filteredLogs.length}
                        </div>
                    </div>

                    <div className="admin-table-container">
                        {loading ? (
                            <div className="loading-spinner">Loading logs...</div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="no-data-message">No activity logs found.</div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>Action</th>
                                        <th>User</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr key={log.logId}>
                                            <td style={{ color: '#666', fontSize: '0.9em' }}>
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td>
                                                <span className="status-badge" style={{
                                                    background: log.action.includes('REJECT') || log.action.includes('FORFEIT') ? '#ffebee' : '#e8f5e9',
                                                    color: log.action.includes('REJECT') || log.action.includes('FORFEIT') ? '#c62828' : '#2e7d32'
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{log.user ? log.user.username : 'System'}</div>
                                                <div style={{ fontSize: '0.8em', color: '#888' }}>{log.user ? `ID: ${log.user.userId}` : ''}</div>
                                            </td>
                                            <td>{log.remarks}</td>
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

export default DeveloperAdminLogs;
