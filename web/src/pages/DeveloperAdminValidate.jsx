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
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [interestRate, setInterestRate] = useState('');
    const [daysUntilDue, setDaysUntilDue] = useState('');

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

    const handleOpenModal = (request) => {
        setSelectedRequest(request);
        setInterestRate('');
        setDaysUntilDue('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRequest(null);
        setInterestRate('');
        setDaysUntilDue('');
    };

    const handleValidate = async () => {
        if (!selectedRequest) return;

        const finalInterestRate = interestRate === '' ? 5 : Number(interestRate);
        const finalDaysUntilDue = daysUntilDue === '' ? 30 : Number(daysUntilDue);

        try {
            await apiService.admin.validatePawn(selectedRequest.pawnId, finalInterestRate, finalDaysUntilDue);
            notifySuccess('Item validated and loan created successfully');
            handleCloseModal();
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error('Error validating pawn:', error);
            const errorMessage = error.message || 'Failed to create loan';
            if (errorMessage.includes('Loan already exists')) {
                notifyError('This item has already been validated and has an active loan');
            } else if (errorMessage.includes('must be APPROVED')) {
                notifyError('Item must be APPROVED before validation');
            } else {
                notifyError(errorMessage);
            }
            handleCloseModal();
        }
    };

    const handleReject = async (pawnId, itemName) => {
        if (!window.confirm(`Reject this item: "${itemName}"? The status will be changed to REJECTED.`)) {
            return;
        }

        try {
            await apiService.admin.updatePawnStatus(pawnId, 'REJECTED');
            notifySuccess('Item rejected successfully');
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error('Error rejecting pawn:', error);
            notifyError('Failed to reject item');
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
                                        <th>Loan Amount</th>
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
                                                    ₱{(req.estimatedValue || req.loanAmount || req.requestedAmount || 0).toFixed(2)}
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
                                                    <div className="validate-actions">
                                                        <button
                                                            className="validate-action-btn validate-btn"
                                                            onClick={() => handleOpenModal(req)}
                                                        >
                                                            Validate & Release
                                                        </button>
                                                        <button
                                                            className="validate-action-btn reject-btn"
                                                            onClick={() => handleReject(req.pawnId, req.itemName)}
                                                        >
                                                            Reject
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

            {showModal && selectedRequest && (
                <div className="validate-modal-overlay" onClick={handleCloseModal}>
                    <div className="validate-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="validate-modal-header">
                            <h2>Validate & Release Loan</h2>
                            <button className="validate-modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="validate-modal-body">
                            <div className="validate-modal-item-info">
                                <h3>{selectedRequest.itemName}</h3>
                                <p>{selectedRequest.brand} - {selectedRequest.size} - {selectedRequest.condition}</p>
                            </div>
                            
                            <div className="validate-modal-form">
                                <div className="validate-form-group">
                                    <label htmlFor="interestRate">Interest Rate (%)</label>
                                    <input
                                        type="number"
                                        id="interestRate"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(e.target.value)}
                                        placeholder="5 (default)"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                    />
                                </div>
                                
                                <div className="validate-form-group">
                                    <label htmlFor="daysUntilDue">Days Until Due</label>
                                    <input
                                        type="number"
                                        id="daysUntilDue"
                                        value={daysUntilDue}
                                        onChange={(e) => setDaysUntilDue(e.target.value)}
                                        placeholder="30 (default)"
                                        min="1"
                                        max="365"
                                    />
                                </div>
                            </div>

                            <div className="validate-modal-summary">
                                <h4>Loan Summary</h4>
                                <div className="validate-summary-row">
                                    <span>Loan Amount:</span>
                                    <span>₱{(selectedRequest.estimatedValue || selectedRequest.loanAmount || selectedRequest.requestedAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="validate-summary-row">
                                    <span>Interest Rate:</span>
                                    <span>{interestRate === '' ? 5 : interestRate}%</span>
                                </div>
                                <div className="validate-summary-row">
                                    <span>Interest Amount:</span>
                                    <span>₱{((selectedRequest.estimatedValue || selectedRequest.loanAmount || selectedRequest.requestedAmount || 0) * ((interestRate === '' ? 5 : Number(interestRate)) / 100)).toFixed(2)}</span>
                                </div>
                                <div className="validate-summary-row total">
                                    <span>Total to Redeem:</span>
                                    <span>₱{((selectedRequest.estimatedValue || selectedRequest.loanAmount || selectedRequest.requestedAmount || 0) * (1 + (interestRate === '' ? 5 : Number(interestRate)) / 100)).toFixed(2)}</span>
                                </div>
                                <div className="validate-summary-row">
                                    <span>Due Date:</span>
                                    <span>{new Date(Date.now() + (daysUntilDue === '' ? 30 : Number(daysUntilDue)) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="validate-modal-footer">
                            <button className="validate-modal-btn cancel" onClick={handleCloseModal}>
                                Cancel
                            </button>
                            <button className="validate-modal-btn confirm" onClick={handleValidate}>
                                Confirm & Release
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeveloperAdminValidate;
