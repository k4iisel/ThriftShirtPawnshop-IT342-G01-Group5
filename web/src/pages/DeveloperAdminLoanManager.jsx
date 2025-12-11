import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';

import ImageModal from '../components/ImageModal';
import apiService from '../services/apiService';
import logo from '../assets/images/logo.png';
import '../styles/DeveloperAdminLoanManager.css';

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

    return (
        <div className="loan-manager-page">
            <header className="loan-manager-header">
                <div className="loan-manager-header-left">
                    <div className="loan-manager-logo">
                        <img src={logo} alt="Logo" className="loan-manager-logo-img" />
                        <h1 className="loan-manager-title">Pawn Management</h1>
                    </div>
                </div>
                <button
                    className="loan-manager-back-btn"
                    onClick={() => navigate('/admin/dashboard')}
                >
                    ← Back
                </button>
            </header>

            <main className="loan-manager-main">
                <div className="loan-manager-content">
                    <div className="loan-manager-section-header">
                        <h2 className="loan-manager-section-title">Active Pawns & Loans</h2>
                        <p className="loan-manager-section-description">Monitor due dates, collect payments, or forfeit overdue items.</p>
                    </div>

                    {loading ? (
                        <div className="loan-manager-loading">
                            <div className="loan-manager-loading-spinner"></div>
                            <div className="loan-manager-loading-text">Loading loans...</div>
                        </div>
                    ) : (
                        <div className="loan-manager-table-container">
                            <table className="loan-manager-table">
                                <thead>
                                    <tr>
                                        <th>Photo</th>
                                        <th>Item Details</th>
                                        <th>Loan Amount</th>
                                        <th>Interest</th>
                                        <th>Redemption Amount</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="loan-manager-empty">
                                                No active loans found.
                                            </td>
                                        </tr>
                                    ) : (
                                        loans.map(loan => {
                                            const images = parseImages(loan.pawnItem?.photos);
                                            const mainImage = images.length > 0 ? images[0] : null;

                                            return (
                                                <tr key={loan.loanId}>
                                                    <td className="loan-manager-photo-cell">
                                                        {mainImage ? (
                                                            <img
                                                                src={mainImage}
                                                                alt={loan.pawnItem?.itemName}
                                                                className="loan-manager-thumbnail"
                                                                onClick={() => handleViewImages(loan.pawnItem?.photos, loan.pawnItem?.itemName)}
                                                            />
                                                        ) : (
                                                            <div className="loan-manager-no-photo">No Photo</div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="loan-manager-item-details">
                                                            <div className="loan-manager-item-name">{loan.pawnItem ? loan.pawnItem.itemName : 'Unknown Item'}</div>
                                                            <div className="loan-manager-item-id">ID: {loan.loanId}</div>
                                                        </div>
                                                    </td>
                                                    <td className="loan-manager-amount">
                                                        ₱{loan.loanAmount?.toFixed(2)}
                                                    </td>
                                                    <td className="loan-manager-interest">
                                                        {loan.interestRate}%
                                                    </td>
                                                    <td className="loan-manager-redeem-amount">
                                                        ₱{loan.totalRedeemAmount?.toFixed(2) || 'N/A'}
                                                    </td>
                                                    <td className="loan-manager-due-date">
                                                        {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td>
                                                        <span className="loan-manager-status">
                                                            {loan.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="loan-manager-actions">
                                                            <button
                                                                className="loan-manager-action-btn paid"
                                                                onClick={() => handlePayment(loan.loanId)}
                                                                title="Mark as Paid/Redeemed"
                                                            >
                                                                💰 Paid
                                                            </button>
                                                            <button
                                                                className="loan-manager-action-btn forfeit"
                                                                onClick={() => handleForfeit(loan.loanId)}
                                                                title="Mark as Forfeited"
                                                            >
                                                                ⚠ Forfeit
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
        </div>
    );
}

export default DeveloperAdminLoanManager;
