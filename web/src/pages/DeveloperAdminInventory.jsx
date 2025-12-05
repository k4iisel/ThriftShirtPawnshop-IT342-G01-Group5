import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import '../styles/AdminDashboard.css';

function DeveloperAdminInventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
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
        if (filter === 'ALL') return true;
        return item.category === filter;
    });

    const categories = ['ALL', ...new Set(inventory.map(item => item.category))];

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-logo">
                        <span className="admin-shield">🛡️</span>
                        <h1>Store Inventory</h1>
                    </div>
                </div>
                <button className="admin-logout-btn" onClick={handleBack}>
                    Back to Dashboard
                </button>
            </header>

            <main className="admin-main">
                <div className="admin-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="admin-actions-bar" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Filter by Category:</span>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                            Total Items: {filteredItems.length}
                        </div>
                    </div>

                    <div className="admin-table-container">
                        {loading ? (
                            <div className="loading-spinner">Loading inventory...</div>
                        ) : filteredItems.length === 0 ? (
                            <div className="no-data-message">No items in inventory.</div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Photos</th>
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => (
                                        <tr key={item.pawnId}>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{item.itemName}</div>
                                                <div style={{ fontSize: '0.85em', color: '#666' }}>ID: {item.pawnId}</div>
                                            </td>
                                            <td>
                                                {item.photos ? (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {(() => {
                                                            try {
                                                                const parsed = JSON.parse(item.photos);
                                                                const urls = Array.isArray(parsed) ? parsed : [item.photos];
                                                                return urls.map((url, i) => (
                                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                                                        <img src={url} alt="Item" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                                    </a>
                                                                ));
                                                            } catch (e) { return null; }
                                                        })()}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td>{item.category}</td>
                                            <td>{item.description}</td>
                                            <td style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                ₱{item.estimatedValue?.toFixed(2) || item.requestedAmount?.toFixed(2)}
                                            </td>
                                            <td>
                                                <span className={`status-badge status-forfeited`}>
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
