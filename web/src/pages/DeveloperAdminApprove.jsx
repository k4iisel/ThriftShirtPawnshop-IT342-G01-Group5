import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import apiService from '../services/apiService';
import '../styles/AdminDashboard.css'; // Reusing admin styles

function DeveloperAdminApprove() {
    // Use admin authentication hook
    useAuth('ADMIN');

    const navigate = useNavigate();
    const { notifySuccess, notifyError } = useNotify();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await apiService.admin.getAllPawnRequests();
            if (response && response.data) {
                setRequests(response.data);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            notifyError('Failed to load pawn requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (pawnId, newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus} this request?`)) {
            return;
        }

        try {
            await apiService.admin.updatePawnStatus(pawnId, newStatus);
            notifySuccess(`Request ${newStatus.toLowerCase()} successfully`);
            // Refresh list
            fetchRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            notifyError(`Failed to ${newStatus.toLowerCase()} request`);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'ALL') return true;
        return req.status === filter;
    });

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-logo">
                        <span className="admin-shield">⚖️</span>
                        <h1>Review Requests</h1>
                    </div>
                    <span className="admin-breadcrumb">Admin / Review</span>
                </div>
                <div className="admin-header-right">
                    <button
                        className="admin-logout-btn"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="admin-main">
                <div className="admin-content">
                    <div className="filter-controls" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                        <button
                            className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
                            onClick={() => setFilter('PENDING')}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: filter === 'PENDING' ? '#007bff' : '#fff', color: filter === 'PENDING' ? '#fff' : '#333', cursor: 'pointer' }}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-btn ${filter === 'APPROVED' ? 'active' : ''}`}
                            onClick={() => setFilter('APPROVED')}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: filter === 'APPROVED' ? '#28a745' : '#fff', color: filter === 'APPROVED' ? '#fff' : '#333', cursor: 'pointer' }}
                        >
                            Approved
                        </button>
                        <button
                            className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
                            onClick={() => setFilter('REJECTED')}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: filter === 'REJECTED' ? '#dc3545' : '#fff', color: filter === 'REJECTED' ? '#fff' : '#333', cursor: 'pointer' }}
                        >
                            Rejected
                        </button>
                        <button
                            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                            onClick={() => setFilter('ALL')}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: filter === 'ALL' ? '#6c757d' : '#fff', color: filter === 'ALL' ? '#fff' : '#333', cursor: 'pointer' }}
                        >
                            All
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">Loading requests...</div>
                    ) : (
                        <div className="table-container" style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <tr>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Item</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Condition</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                                                No requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map(req => (
                                            <tr key={req.pawnId} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{req.itemName}</div>
                                                    <div style={{ fontSize: '0.85em', color: '#6c757d' }}>{req.brand} - {req.size}</div>
                                                </td>
                                                <td style={{ padding: '12px' }}>{req.category}</td>
                                                <td style={{ padding: '12px' }}>{req.condition}</td>
                                                <td style={{ padding: '12px' }}>₱{req.requestedAmount?.toFixed(2)}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85em',
                                                        fontWeight: 'bold',
                                                        background: req.status === 'APPROVED' ? '#d4edda' : req.status === 'REJECTED' ? '#f8d7da' : '#fff3cd',
                                                        color: req.status === 'APPROVED' ? '#155724' : req.status === 'REJECTED' ? '#721c24' : '#856404'
                                                    }}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    {req.status === 'PENDING' && (
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.pawnId, 'APPROVED')}
                                                                style={{
                                                                    padding: '5px 10px',
                                                                    background: '#28a745',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.pawnId, 'REJECTED')}
                                                                style={{
                                                                    padding: '5px 10px',
                                                                    background: '#dc3545',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default DeveloperAdminApprove;
