import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import apiService from '../services/apiService';
import ImageModal from '../components/ImageModal';
import logo from '../assets/images/logo.png';
import '../styles/DeveloperAdmin.css';

function DeveloperAdminApprove() {
    // Use admin authentication hook
    useAuth('ADMIN');

    const navigate = useNavigate();
    const { notifySuccess, notifyError } = useNotify();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedItemName, setSelectedItemName] = useState('');

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

    const handleViewImages = (req) => {
        let images = [];
        try {
            if (req.photos && typeof req.photos === 'string') {
                const parsed = JSON.parse(req.photos);
                images = Array.isArray(parsed) ? parsed : [req.photos];
            } else if (Array.isArray(req.photos)) {
                images = req.photos;
            }
        } catch (error) {
            console.error('Error parsing photos:', error);
        }
        
        if (images.length === 0) {
            images = [`https://via.placeholder.com/400x400?text=${encodeURIComponent(req.itemName)}`];
        }
        
        setSelectedImages(images);
        setSelectedItemName(req.itemName);
        setShowImageModal(true);
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
        // Exclude FORFEITED, PAWNED, and REDEEMED statuses
        const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
        if (!allowedStatuses.includes(req.status)) return false;
        
        // Apply filter
        if (filter === 'ALL') return true;
        return req.status === filter;
    });

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-logo">
                        <img src={logo} alt="Thrift Shirt Pawnshop" className="admin-logo-img" />
                        <h1>Review Requests</h1>
                    </div>
                    <span className="admin-breadcrumb">Admin / Review</span>
                </div>
                <div className="admin-header-right">
                    <button
                        className="admin-back-btn"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        ← Back to Dashboard
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
                            Pending ({requests.filter(r => r.status === 'PENDING').length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'APPROVED' ? 'active' : ''}`}
                            onClick={() => setFilter('APPROVED')}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: filter === 'APPROVED' ? '#28a745' : '#fff', color: filter === 'APPROVED' ? '#fff' : '#333', cursor: 'pointer' }}
                        >
                            Approved ({requests.filter(r => r.status === 'APPROVED').length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`}
                            onClick={() => setFilter('REJECTED')}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: filter === 'REJECTED' ? '#dc3545' : '#fff', color: filter === 'REJECTED' ? '#fff' : '#333', cursor: 'pointer' }}
                        >
                            Rejected ({requests.filter(r => r.status === 'REJECTED').length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                            onClick={() => setFilter('ALL')}
                            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: filter === 'ALL' ? '#6c757d' : '#fff', color: filter === 'ALL' ? '#fff' : '#333', cursor: 'pointer' }}
                        >
                            All ({requests.filter(r => ['PENDING', 'APPROVED', 'REJECTED'].includes(r.status)).length})
                        </button>
                    </div>

                    {loading ? (
                        <div className="admin-loading">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">Loading requests...</div>
                        </div>
                    ) : (
                        <div className="table-container" style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <tr>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Item</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Photos</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Condition</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Loan Amount</th>
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
                                                <td style={{ padding: '12px' }}>
                                                    {req.photos ? (
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            {(() => {
                                                                try {
                                                                    const parsed = JSON.parse(req.photos);
                                                                    const urls = Array.isArray(parsed) ? parsed : [req.photos];
                                                                    return urls.map((url, i) => (
                                                                        <img 
                                                                            key={i} 
                                                                            src={url} 
                                                                            alt="Item" 
                                                                            style={{ 
                                                                                width: '40px', 
                                                                                height: '40px', 
                                                                                objectFit: 'cover', 
                                                                                borderRadius: '4px',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                            onClick={() => handleViewImages(req)}
                                                                        />
                                                                    ));
                                                                } catch (e) { return null; }
                                                            })()}
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td style={{ padding: '12px' }}>{req.category}</td>
                                                <td style={{ padding: '12px' }}>{req.condition}</td>
                                                <td style={{ padding: '12px' }}>₱{(req.loanAmount || req.requestedAmount || 0).toFixed(2)}</td>
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

export default DeveloperAdminApprove;
