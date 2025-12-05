import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import apiService from '../services/apiService';
import '../styles/AdminDashboard.css';

function DeveloperAdminLoanManager() {
    useAuth('ADMIN');

    const navigate = useNavigate();
    const { notifySuccess, notifyError } = useNotify();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const response = await apiService.admin.getActiveLoans();
            if (response && response.data) {
                setLoans(response.data);
            } else {
                setLoans([]);
            }
        } catch (error) {
            console.error('Error fetching loans:', error);
            notifyError('Failed to load active loans');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (loanId) => {
        if (!window.confirm('Mark this loan as fully PAID? This will redeem the item.')) {
            return;
        }

        try {
            await apiService.admin.processLoanPayment(loanId);
            notifySuccess('Loan marked as PAID. Item Redeemed.');
            fetchLoans();
        } catch (error) {
            console.error('Error processing payment:', error);
            notifyError('Failed to process payment');
        }
    };

    const handleForfeit = async (loanId) => {
        if (!window.confirm('WARNING: Mark this loan as FORFEITED? This action cannot be undone.')) {
            return;
        }

        try {
            await apiService.admin.forfeitLoan(loanId);
            notifySuccess('Loan marked as FORFEITED.');
            fetchLoans();
        } catch (error) {
            console.error('Error forfeiting loan:', error);
            notifyError('Failed to forfeit loan');
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-logo">
                        <span className="admin-shield">💰</span>
                        <h1>Loan Manager</h1>
                    </div>
                    <span className="admin-breadcrumb">Admin / Loan Management</span>
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
                        <h2>Active Loans</h2>
                        <p className="text-muted">Monitor due dates, collect payments, or forfeit overdue items.</p>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">Loading loans...</div>
                    ) : (
                        <div className="table-container" style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <tr>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Item Details</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Loan Amount</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Interest</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Due Date</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                                                No active loans found.
                                            </td>
                                        </tr>
                                    ) : (
                                        loans.map(loan => (
                                            <tr key={loan.loanId} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{loan.pawnItem ? loan.pawnItem.itemName : 'Unknown Item'}</div>
                                                    <div style={{ fontSize: '0.85em', color: '#6c757d' }}>ID: {loan.loanId}</div>
                                                </td>
                                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#28a745' }}>
                                                    ₱{loan.loanAmount?.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    {loan.interestRate}%
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85em',
                                                        background: '#e3f2fd',
                                                        color: '#0d47a1'
                                                    }}>
                                                        {loan.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handlePayment(loan.loanId)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                background: '#28a745',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.9em'
                                                            }}
                                                            title="Mark as Paid (Redeem)"
                                                        >
                                                            ✓ Pay
                                                        </button>
                                                        <button
                                                            onClick={() => handleForfeit(loan.loanId)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                background: '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.9em'
                                                            }}
                                                            title="Mark as Forfeited"
                                                        >
                                                            ⚠ Forfeit
                                                        </button>
                                                    </div>
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

export default DeveloperAdminLoanManager;
