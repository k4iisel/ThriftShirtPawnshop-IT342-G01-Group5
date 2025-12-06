import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import logo from '../assets/images/logo.png';
import '../styles/DeveloperAdmin.css';

function DeveloperAdminInventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
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

    const filteredItems = inventory.filter(item => {
        const statusMatch = statusFilter === 'ALL' || item.status === statusFilter;
        return statusMatch;
    });

    const statuses = ['ALL', ...new Set(inventory.map(item => item.status))];

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
                        <div className="dev-admin-filters">
                            <select
                                className="dev-admin-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Items</option>
                                {statuses.slice(1).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
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
                                                                    onClick={() => window.open(urls[0], '_blank')}
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
                                                ₱{item.estimatedValue?.toFixed(2) || item.requestedAmount?.toFixed(2)}
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
        </div>
    );
}

export default DeveloperAdminInventory;
