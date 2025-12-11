import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import ImageModal from '../components/ImageModal';
import logo from '../assets/images/logo.png';
import '../styles/DeveloperAdmin.css';

function DeveloperAdminInventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedItemName, setSelectedItemName] = useState('');
    const navigate = useNavigate();
    const { notifyError } = useNotify();

    useAuth('ADMIN');

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const apiService = await import('../services/apiService');
            const response = await apiService.default.admin.getInventory();
            if (response.success && response.data) {
                setInventory(response.data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            notifyError('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/dashboard');
    };

    const handleViewImages = (item) => {
        let images = [];
        try {
            if (item.photos && typeof item.photos === 'string') {
                const parsed = JSON.parse(item.photos);
                images = Array.isArray(parsed) ? parsed : [item.photos];
            } else if (Array.isArray(item.photos)) {
                images = item.photos;
            }
        } catch (error) {
            console.error('Error parsing photos:', error);
        }
        
        if (images.length === 0) {
            images = [`https://via.placeholder.com/400x400?text=${encodeURIComponent(item.itemName)}`];
        }
        
        setSelectedImages(images);
        setSelectedItemName(item.itemName);
        setShowImageModal(true);
    };

    const filteredItems = inventory.filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.itemName?.toLowerCase().includes(query) ||
            item.status?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.brand?.toLowerCase().includes(query) ||
            item.pawnId?.toString().includes(query)
        );
    });

    return (
        <div className="dev-admin-page">
            <header className="dev-admin-header">
                <div className="dev-admin-header-left">
                    <div className="dev-admin-logo">
                        <img src={logo} alt="Logo" className="dev-admin-logo-img" />
                        <h1 className="dev-admin-title">Inventory</h1>
                    </div>
                </div>
                <button className="dev-admin-back-btn" onClick={handleBack}>
                    ← Back
                </button>
            </header>

            <main className="dev-admin-main">
                <div className="dev-admin-content">
                    <div className="dev-admin-toolbar">
                        <div className="dev-admin-search">
                            <input
                                type="text"
                                className="dev-admin-search-input"
                                placeholder="Search by item name, status, description, brand, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="dev-admin-count">
                            {filteredItems.length} items
                        </div>
                    </div>

                    <div className="dev-admin-table-container">
                        {loading ? (
                            <div className="dev-admin-loading">
                                <div className="dev-admin-loading-spinner"></div>
                                <div className="dev-admin-loading-text">Loading inventory...</div>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="dev-admin-empty">No items in inventory.</div>
                        ) : (
                            <table className="dev-admin-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Photo</th>
                                        <th>Description</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => (
                                        <tr key={item.pawnId}>
                                            <td>
                                                <div className="dev-admin-item-name">{item.itemName}</div>
                                                <div className="dev-admin-item-id">#{item.pawnId}</div>
                                            </td>
                                            <td>
                                                {item.photos ? (
                                                    (() => {
                                                        try {
                                                            const parsed = JSON.parse(item.photos);
                                                            const urls = Array.isArray(parsed) ? parsed : [item.photos];
                                                            return (
                                                                <img 
                                                                    src={urls[0]} 
                                                                    alt="Item" 
                                                                    className="dev-admin-photo"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleViewImages(item)}
                                                                />
                                                            );
                                                        } catch (e) {
                                                            return <span className="dev-admin-no-photo">-</span>;
                                                        }
                                                    })()
                                                ) : <span className="dev-admin-no-photo">-</span>}
                                            </td>
                                            <td className="dev-admin-item-desc">{item.description}</td>
                                            <td className="dev-admin-item-value">
                                                {(() => {
                                                    const baseAmount = item.estimatedValue || item.loanAmount || item.requestedAmount || 0;
                                                    const interestRate = item.interestRate || 5;
                                                    const withInterest = baseAmount * (1 + interestRate / 100);
                                                    return `₱${baseAmount.toFixed(2)} (+ ${interestRate}%: ₱${withInterest.toFixed(2)})`;
                                                })()}
                                            </td>
                                            <td>
                                                <span className={`dev-admin-status ${item.status.toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
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

export default DeveloperAdminInventory;
