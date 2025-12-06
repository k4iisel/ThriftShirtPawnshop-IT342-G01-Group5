import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import apiService from '../services/apiService';
import logo from '../assets/images/logo.png';
import '../styles/DeveloperAdminValidate.css';

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
        <div className="validate-page">
            <header className="validate-header">
                <div className="validate-header-left">
                    <div className="validate-logo">
                        <img src={logo} alt="Logo" className="validate-logo-img" />
                        <h1 className="validate-title">Validate Items</h1>
                    </div>
                </div>
                <button
                    className="validate-back-btn"
                    onClick={() => navigate('/admin/dashboard')}
                >
                    ← Back
                </button>
            </header>

            <main className="validate-main">
                <div className="validate-content">
                    <div className="validate-section-header">
                        <h2 className="validate-section-title">Ready for Loan Release</h2>
                        <p className="validate-section-description">These items have been approved online. Validate the physical item to release the loan.</p>
                    </div>

                    {loading ? (
                        <div className="validate-loading">
                            <div className="validate-loading-spinner"></div>
                            <div className="validate-loading-text">Loading requests...</div>
                        </div>
                    ) : (
                        <div className="validate-table-container">
                            <table className="validate-table">
                                <thead>
                                    <tr>
                                        <th>Item Details</th>
                                        <th>Condition</th>
                                        <th>Approved Amount</th>
                                        <th>Appraisal Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="validate-empty">
                                                No approved requests waiting for validation.
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map(req => (
                                            <tr key={req.pawnId}>
                                                <td>
                                                    <div className="validate-item-details">
                                                        <div className="validate-item-name">{req.itemName}</div>
                                                        <div className="validate-item-info">{req.brand} - {req.size}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="validate-condition">{req.condition}</span>
                                                </td>
                                                <td className="validate-amount">
                                                    ₱{(req.estimatedValue || req.requestedAmount)?.toFixed(2)}
                                                </td>
                                                <td className="validate-date">
                                                    {req.appraisalDate ? 
                                                        new Date(req.appraisalDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        }) : 
                                                        new Date().toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })
                                                    }
                                                </td>
                                                <td>
                                                    <button
                                                        className="validate-action-btn"
                                                        onClick={() => handleValidate(req.pawnId, (req.estimatedValue || req.requestedAmount))}
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
