import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useNotify from '../hooks/useNotify';
import { formatRoleName, getRoleBadgeClass } from '../utils/roleUtils';
import logo from '../assets/images/logo.png';
import '../styles/DeveloperAdmin.css';
import '../styles/DeveloperAdminWallet.css';

function DeveloperAdminWallet() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'add' or 'remove'
    const [selectedUser, setSelectedUser] = useState(null);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const navigate = useNavigate();
    const { notifySuccess, notifyError } = useNotify();

    useAuth('ADMIN');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const apiService = await import('../services/apiService');
            const response = await apiService.default.admin.getAllUsers();
            if (response.success && response.data) {
                // Filter only USER role
                const regularUsers = response.data.filter(user => user.role === 'USER');
                setUsers(regularUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            notifyError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/dashboard');
    };

    const openModal = (type, user) => {
        setModalType(type);
        setSelectedUser(user);
        setAmount('');
        setReason('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setSelectedUser(null);
        setAmount('');
        setReason('');
    };

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            notifyError('Please enter a valid amount');
            return;
        }

        if (!reason.trim()) {
            notifyError('Please provide a reason');
            return;
        }

        try {
            const apiService = await import('../services/apiService');
            let response;

            if (modalType === 'add') {
                response = await apiService.default.admin.addCashToUser(
                    selectedUser.id,
                    parseFloat(amount),
                    reason
                );
                notifySuccess(`Successfully added ₱${amount} to ${selectedUser.username}'s wallet`);
            } else {
                response = await apiService.default.admin.removeCashFromUser(
                    selectedUser.id,
                    parseFloat(amount),
                    reason
                );
                notifySuccess(`Successfully removed ₱${amount} from ${selectedUser.username}'s wallet`);
            }

            // Update local user data
            if (response.success) {
                setUsers(users.map(user =>
                    user.id === selectedUser.id
                        ? { ...user, walletBalance: response.data.newBalance }
                        : user
                ));
            }

            closeModal();
        } catch (error) {
            console.error('Error updating wallet:', error);
            notifyError(error.message || 'Failed to update wallet');
        }
    };

    const filteredUsers = users.filter(user => {
        if (!filter) return true;
        const search = filter.toLowerCase();
        return (
            (user.username || '').toLowerCase().includes(search) ||
            (user.email || '').toLowerCase().includes(search) ||
            (user.firstName || '').toLowerCase().includes(search) ||
            (user.lastName || '').toLowerCase().includes(search)
        );
    });

    return (
        <div className="dev-admin-page">
            <header className="dev-admin-header">
                <div className="dev-admin-header-left">
                    <div className="dev-admin-logo">
                        <img src={logo} alt="Logo" className="dev-admin-logo-img" />
                        <span className="dev-admin-logo-text">ThriftShirt Pawnshop</span>
                    </div>
                </div>
                <div className="dev-admin-header-right">
                    <button className="dev-admin-back-btn" onClick={handleBack}>
                        ← Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="dev-admin-content">
                <div className="dev-admin-container">
                    <div className="dev-admin-title-section">
                        <h1 className="dev-admin-title">Wallet Management</h1>
                        <p className="dev-admin-subtitle">Add or remove cash from user wallets</p>
                    </div>

                    <div className="dev-admin-actions">
                        <div className="dev-admin-search">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="dev-admin-search-input"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="dev-admin-loading">Loading users...</div>
                    ) : (
                        <div className="dev-admin-table-container">
                            <table className="dev-admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Wallet Balance</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td className="username-cell">{user.username}</td>
                                                <td>{user.firstName} {user.lastName}</td>
                                                <td>{user.email}</td>
                                                <td className="wallet-balance-cell">
                                                    ₱{user.walletBalance ? user.walletBalance.toFixed(2) : '0.00'}
                                                </td>
                                                <td>
                                                    <span className={`role-badge ${user.enabled ? 'role-user' : 'role-banned'}`}>
                                                        {user.enabled ? 'Active' : 'Banned'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="wallet-action-buttons">
                                                        <button
                                                            className="wallet-btn add-btn"
                                                            onClick={() => openModal('add', user)}
                                                            disabled={!user.enabled}
                                                        >
                                                            + Add Cash
                                                        </button>
                                                        <button
                                                            className="wallet-btn remove-btn"
                                                            onClick={() => openModal('remove', user)}
                                                            disabled={!user.enabled}
                                                        >
                                                            − Remove Cash
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="no-data">No users found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="wallet-modal-overlay" onClick={closeModal}>
                    <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="wallet-modal-close" onClick={closeModal}>&times;</button>
                        
                        <h2 className="wallet-modal-title">
                            {modalType === 'add' ? 'Add Cash to Wallet' : 'Remove Cash from Wallet'}
                        </h2>
                        
                        <div className="wallet-modal-user-info">
                            <p><strong>User:</strong> {selectedUser?.username}</p>
                            <p><strong>Current Balance:</strong> ₱{selectedUser?.walletBalance?.toFixed(2) || '0.00'}</p>
                        </div>

                        <div className="wallet-modal-form">
                            <div className="wallet-form-group">
                                <label>Amount (₱)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    step="0.01"
                                    min="0.01"
                                />
                            </div>

                            <div className="wallet-form-group">
                                <label>Reason</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter reason for this transaction"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="wallet-modal-actions">
                            <button className="wallet-modal-cancel" onClick={closeModal}>
                                Cancel
                            </button>
                            <button 
                                className={`wallet-modal-submit ${modalType === 'add' ? 'add' : 'remove'}`}
                                onClick={handleSubmit}
                            >
                                {modalType === 'add' ? 'Add Cash' : 'Remove Cash'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeveloperAdminWallet;
