import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import apiService from '../services/apiService';
import '../styles/AdminDashboard.css';

function DeveloperAdminValidate() {
    useAuth('ADMIN');

    const navigate = useNavigate();
    const { notifySuccess, notifyError } = useNotify();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            // Fetch all requests and filter for APPROVED status
            const response = await apiService.admin.getAllPawnRequests();
            if (response && response.data) {
                const approvedRequests = response.data.filter(req => req.status === 'APPROVED');
                setRequests(approvedRequests);
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

    const handleValidate = async (pawnId, amount) => {
        if (!window.confirm(`Confirm validation? This will create a loan for ₱${amount} with 5% interest and 30-day term.`)) {
            return;
        }

        try {
            await apiService.admin.validatePawn(pawnId);
            notifySuccess('Item validated and loan created successfully');
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error('Error validating pawn:', error);
            notifyError('Failed to create loan');
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-logo">
                        <span className="admin-shield">🏷️</span>
                        <h1>Validate Items</h1>
                    </div>
                    <span className="admin-breadcrumb">Admin / Item Validation</span>
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
                    <div className="admin-section-header" style={{ marginBottom: '20px' }}>
                        <h2>Ready for Loan Release</h2>
                        <p className="text-muted">These items have been approved online. Validate the physical item to release the loan.</p>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">Loading requests...</div>
                    ) : (
                        <div className="table-container" style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <tr>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Item Details</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Condition</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Approved Amount</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Appraisal Date</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                                                No approved requests waiting for validation.
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map(req => (
                                            <tr key={req.pawnId} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{req.itemName}</div>
                                                    <div style={{ fontSize: '0.85em', color: '#6c757d' }}>{req.brand} - {req.size}</div>
                                                </td>
                                                <td style={{ padding: '12px' }}>{req.condition}</td>
                                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#28a745' }}>
                                                    ₱{(req.estimatedValue || req.requestedAmount)?.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    {req.appraisalDate ? new Date(req.appraisalDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <button
                                                        onClick={() => handleValidate(req.pawnId, (req.estimatedValue || req.requestedAmount))}
                                                        style={{
                                                            padding: '8px 16px',
                                                            background: '#007bff',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        Validate & Release Loan
                                                    </button>
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

export default DeveloperAdminValidate;
