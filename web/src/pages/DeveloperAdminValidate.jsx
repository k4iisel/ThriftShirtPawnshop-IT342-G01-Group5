import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import ImageModal from '../components/ImageModal';
import apiService from '../services/apiService';
import logo from '../assets/images/logo.png';
import '../styles/DeveloperAdminValidate.css';

function DeveloperAdminValidate() {
    useAuth('ADMIN');

    const navigate = useNavigate();
    const { notifySuccess, notifyError } = useNotify();

    // State
    const [activeTab, setActiveTab] = useState('assessment'); // 'assessment' or 'validation'
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Image Modal State
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedItemName, setSelectedItemName] = useState('');

    const parseImages = (photosStr) => {
        try {
            if (!photosStr) return [];
            if (Array.isArray(photosStr)) return photosStr;
            return JSON.parse(photosStr);
        } catch (e) {
            console.error("Failed to parse photos", e);
            return [];
        }
    };

    const handleViewImages = (photosStr, itemName) => {
        const images = parseImages(photosStr);
        if (images.length > 0) {
            setSelectedImages(images);
            setSelectedItemName(itemName);
            setShowImageModal(true);
        }
    };

    // Assessment State
    const [showAssessModal, setShowAssessModal] = useState(false);
    const [selectedForAssessment, setSelectedForAssessment] = useState(null);
    const [assessAmount, setAssessAmount] = useState('');
    const [assessRemarks, setAssessRemarks] = useState('');

    // Validation State
    const [showValidateModal, setShowValidateModal] = useState(false);
    const [selectedForValidation, setSelectedForValidation] = useState(null);
    const [interestRate, setInterestRate] = useState('');
    const [daysUntilDue, setDaysUntilDue] = useState('');
    const [customLoanAmount, setCustomLoanAmount] = useState('');

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

    // Filtered lists
    const pendingRequests = requests.filter(req => req.status === 'PENDING');
    const acceptedRequests = requests.filter(req => req.status === 'ACCEPTED');

    // --- Assessment Handlers ---
    const handleOpenAssessModal = (request) => {
        setSelectedForAssessment(request);
        setAssessAmount('');
        setAssessRemarks('');
        setInterestRate('5');
        setDaysUntilDue('30');
        setShowAssessModal(true);
    };

    const handleCloseAssessModal = () => {
        setShowAssessModal(false);
        setSelectedForAssessment(null);
        setAssessAmount('');
        setAssessRemarks('');
    };

    const submitAssessment = async (e) => {
        e.preventDefault();
        if (!selectedForAssessment || !assessAmount) return;

        try {
            await apiService.admin.assessPawnRequest(
                selectedForAssessment.pawnId,
                parseFloat(assessAmount),
                assessRemarks,
                interestRate ? parseFloat(interestRate) : 5,
                daysUntilDue ? parseInt(daysUntilDue) : 30
            );
            notifySuccess('Offer sent to user successfully');
            handleCloseAssessModal();
            fetchRequests();
        } catch (error) {
            console.error('Error submitting assessment:', error);
            notifyError(error.message || 'Failed to submit assessment');
        }
    };

    // --- Validation Handlers ---
    const handleOpenValidateModal = (request) => {
        setSelectedForValidation(request);
        setInterestRate('');
        setDaysUntilDue('');
        setCustomLoanAmount('');
        setShowValidateModal(true);
    };

    const handleCloseValidateModal = () => {
        setShowValidateModal(false);
        setSelectedForValidation(null);
        setInterestRate('');
        setDaysUntilDue('');
        setCustomLoanAmount('');
    };

    const submitValidation = async () => {
        if (!selectedForValidation) return;

        // Use defaults since user requested to remove inputs from this modal
        // "The offer and interest rate should be in the make offer... and not here"
        const finalInterestRate = 5;
        const finalDaysUntilDue = 30;
        const finalCustomAmount = null; // Use accepted offer amount

        try {
            await apiService.admin.validatePawn(selectedForValidation.pawnId, finalInterestRate, finalDaysUntilDue, finalCustomAmount);
            notifySuccess('Item validated and loan created successfully');
            handleCloseValidateModal();
            fetchRequests();
        } catch (error) {
            console.error('Error validating pawn:', error);
            notifyError(error.message || 'Failed to create loan');
            handleCloseValidateModal();
        }
    };

    const handleReject = async (pawnId, itemName) => {
        if (!window.confirm(`Reject this item: "${itemName}"? The status will be changed to REJECTED.`)) {
            return;
        }

        try {
            await apiService.admin.updatePawnStatus(pawnId, 'REJECTED');
            notifySuccess('Item rejected successfully');
            fetchRequests();
        } catch (error) {
            console.error('Error rejecting pawn:', error);
            notifyError('Failed to reject item');
        }
    };

    // Helper to view photos (reusing existing logic or simplified)
    const viewPhotos = (request) => {
        // Implementation for viewing photos, could invoke a parent Modal or alert links
        // For now, let's assume images are handled/displayed in row or ignored for this specific view to save space
        // Or we can add a 'View Photos' button that could open a modal (not implemented in this snippet fully, but logic exists in Dashboard)
        // We will just show item details text.
        console.log("View photos for", request.itemName);
    };

    return (
        <div className="validate-page">
            <header className="validate-header">
                <div className="validate-header-left">
                    <div className="validate-logo">
                        <img src={logo} alt="Logo" className="validate-logo-img" />
                        <h1 className="validate-title">Pawn Processing</h1>
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

                    {/* Tabs */}
                    <div className="admin-tabs">
                        <button
                            className={`admin-tab-btn ${activeTab === 'assessment' ? 'active' : ''}`}
                            onClick={() => setActiveTab('assessment')}
                        >
                            Assessment Queue ({pendingRequests.length})
                        </button>
                        <button
                            className={`admin-tab-btn ${activeTab === 'validation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('validation')}
                        >
                            Approved / Validation ({acceptedRequests.length})
                        </button>
                    </div>

                    <div className="validate-section-header">
                        <h2 className="validate-section-title">
                            {activeTab === 'assessment' ? 'Review & Assess Items' : 'Validate & Release Loans'}
                        </h2>
                        <p className="validate-section-description">
                            {activeTab === 'assessment'
                                ? 'Review photos and item details to make an initial offer.'
                                : 'Validate physical items for users who accepted your offer.'}
                        </p>
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
                                        <th>Photo</th>
                                        <th>Item Details</th>
                                        <th>Condition</th>
                                        {activeTab === 'validation' && <th>Offered Amount</th>}
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'assessment' ? pendingRequests : acceptedRequests).length === 0 ? (
                                        <tr>
                                            <td colSpan={activeTab === 'validation' ? "6" : "5"} className="validate-empty">
                                                No items in this queue.
                                            </td>
                                        </tr>
                                    ) : (
                                        (activeTab === 'assessment' ? pendingRequests : acceptedRequests).map(req => {
                                            const images = parseImages(req.photos);
                                            const mainImage = images.length > 0 ? images[0] : null;

                                            return (
                                                <tr key={req.pawnId}>
                                                    <td className="validate-photo-cell">
                                                        {mainImage ? (
                                                            <img
                                                                src={mainImage}
                                                                alt={req.itemName}
                                                                className="validate-thumbnail"
                                                                onClick={() => handleViewImages(req.photos, req.itemName)}
                                                            />
                                                        ) : (
                                                            <div className="validate-no-photo">No Photo</div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="validate-item-details">
                                                            <div className="validate-item-name">{req.itemName}</div>
                                                            <div className="validate-item-info">{req.brand} - {req.size}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="validate-condition">{req.condition}</span>
                                                    </td>

                                                    {activeTab === 'validation' && (
                                                        <td className="validate-amount">
                                                            ₱{parseFloat(req.offeredAmount || 0).toFixed(2)}
                                                        </td>
                                                    )}

                                                    <td className="validate-date">
                                                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                                                    </td>

                                                    <td>
                                                        <div className="validate-actions">
                                                            {activeTab === 'assessment' ? (
                                                                <button
                                                                    className="validate-action-btn validate-btn"
                                                                    onClick={() => handleOpenAssessModal(req)}
                                                                >
                                                                    Make Offer
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="validate-action-btn validate-btn"
                                                                    onClick={() => handleOpenValidateModal(req)}
                                                                >
                                                                    Validate & Pay
                                                                </button>
                                                            )}

                                                            <button
                                                                className="validate-action-btn reject-btn"
                                                                onClick={() => handleReject(req.pawnId, req.itemName)}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Assessment Modal */}
            {showAssessModal && selectedForAssessment && (
                <div className="validate-modal-overlay" onClick={handleCloseAssessModal}>
                    <div className="validate-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="validate-modal-header">
                            <h2>Make an Offer</h2>
                            <button className="validate-modal-close" onClick={handleCloseAssessModal}>×</button>
                        </div>
                        <form onSubmit={submitAssessment}>
                            <div className="validate-modal-body">
                                <div className="validate-modal-item-info">
                                    <h3>{selectedForAssessment.itemName}</h3>
                                    <p>{selectedForAssessment.brand} - {selectedForAssessment.condition}</p>
                                    <p className="description">{selectedForAssessment.description}</p>
                                </div>

                                <div className="validate-modal-form">
                                    <div className="validate-form-group">
                                        <label htmlFor="assessAmount">Offer Amount (₱) *</label>
                                        <input
                                            type="number"
                                            id="assessAmount"
                                            value={assessAmount}
                                            onChange={(e) => setAssessAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            min="1"
                                            step="0.01"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="validate-form-group">
                                        <label htmlFor="assessRemarks">Remarks (Optional)</label>
                                        <textarea
                                            id="assessRemarks"
                                            value={assessRemarks}
                                            onChange={(e) => setAssessRemarks(e.target.value)}
                                            placeholder="Add notes for the user..."
                                            rows="3"
                                        />
                                    </div>
                                    <div className="validate-form-group-row">
                                        <div className="validate-form-group half">
                                            <label htmlFor="interestRate">Interest Rate (%)</label>
                                            <input
                                                type="number"
                                                id="interestRate"
                                                value={interestRate}
                                                onChange={(e) => setInterestRate(e.target.value)}
                                                placeholder="5"
                                                min="0"
                                                step="0.1"
                                            />
                                        </div>
                                        <div className="validate-form-group half">
                                            <label htmlFor="daysUntilDue">Duration (Days)</label>
                                            <input
                                                type="number"
                                                id="daysUntilDue"
                                                value={daysUntilDue}
                                                onChange={(e) => setDaysUntilDue(e.target.value)}
                                                placeholder="30"
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="validate-modal-footer">
                                <button type="button" className="validate-modal-btn cancel" onClick={handleCloseAssessModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="validate-modal-btn confirm">
                                    Submit Offer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Validation Modal */}
            {showValidateModal && selectedForValidation && (
                <div className="validate-modal-overlay" onClick={handleCloseValidateModal}>
                    <div className="validate-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="validate-modal-header">
                            <h2>Validate & Release Loan</h2>
                            <button className="validate-modal-close" onClick={handleCloseValidateModal}>×</button>
                        </div>
                        <div className="validate-modal-body">
                            <div className="validate-modal-item-info">
                                <h3>{selectedForValidation.itemName}</h3>
                                <div className="accepted-offer-badge">
                                    User Accepted Offer: ₱{parseFloat(selectedForValidation.offeredAmount || 0).toFixed(2)}
                                </div>
                            </div>

                            <div className="validate-modal-summary">
                                <h4>Loan Summary</h4>
                                <div className="validate-summary-row">
                                    <span>Loan Amount:</span>
                                    <span>₱{parseFloat(selectedForValidation.offeredAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="validate-summary-row">
                                    <span>Interest Rate:</span>
                                    <span>{selectedForValidation.proposedInterestRate || 5}%</span>
                                </div>
                                <div className="validate-summary-row">
                                    <span>Loan Duration:</span>
                                    <span>{selectedForValidation.proposedLoanDuration || 30} days</span>
                                </div>
                                <div className="validate-summary-row total">
                                    <span>Payout to User:</span>
                                    <span>₱{parseFloat(selectedForValidation.offeredAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <p className="validate-modal-note" style={{ marginTop: '16px', color: '#666', fontSize: '13px', fontStyle: 'italic' }}>
                                By confirming, you acknowledge that the item has been physically validated and cash has been released to the user.
                            </p>
                        </div>
                        <div className="validate-modal-footer">
                            <button className="validate-modal-btn cancel" onClick={handleCloseValidateModal}>
                                Cancel
                            </button>
                            <button className="validate-modal-btn confirm" onClick={submitValidation}>
                                Confirm & Release
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Image Modal */}
            {showImageModal && (
                <ImageModal
                    images={selectedImages}
                    itemName={selectedItemName}
                    onClose={() => setShowImageModal(false)}
                />
            )}
        </div>
    );
}

export default DeveloperAdminValidate;
