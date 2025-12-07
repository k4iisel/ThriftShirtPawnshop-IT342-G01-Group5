import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import ImageModal from '../components/ImageModal';
import useNotify from '../hooks/useNotify';
import apiService from '../services/apiService';
import '../styles/History.css';

function History() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [clearingHistory, setClearingHistory] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState('');
  const notify = useNotify();

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const deleteTransaction = async (logId) => {
    if (deletingItems.has(logId)) return;
    
    try {
      setDeletingItems(prev => new Set(prev).add(logId));
      const response = await apiService.loan.deleteTransaction(logId);
      
      if (response.success) {
        setHistoryData(prev => prev.filter(item => item.id !== logId));
        notify.notifySuccess('Transaction deleted successfully');
      } else {
        notify.notifyError('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      notify.notifyError('Error deleting transaction: ' + error.message);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(logId);
        return newSet;
      });
    }
  };

  const clearAllHistory = async () => {
    if (clearingHistory) return;
    
    const confirmed = window.confirm('Are you sure you want to clear all transaction history? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      setClearingHistory(true);
      const response = await apiService.loan.clearTransactionHistory();
      
      if (response.success) {
        setHistoryData([]);
        notify.notifySuccess('Transaction history cleared successfully');
      } else {
        notify.notifyError('Failed to clear transaction history');
      }
    } catch (error) {
      console.error('Error clearing transaction history:', error);
      notify.notifyError('Error clearing transaction history: ' + error.message);
    } finally {
      setClearingHistory(false);
    }
  };

  const handleViewImages = (transaction) => {
    let images = [];
    
    // Try to parse photos from transaction.photos if available
    if (transaction.photos) {
      try {
        const photosData = JSON.parse(transaction.photos);
        if (Array.isArray(photosData)) {
          images = photosData;
        } else if (typeof photosData === 'string') {
          images = [photosData];
        }
      } catch (e) {
        // If parsing fails, treat as single image URL
        images = [transaction.photos];
      }
    }
    
    // If no images, use placeholder
    if (images.length === 0) {
      images = [`https://via.placeholder.com/400x400?text=${encodeURIComponent(transaction.itemName)}`];
    }
    
    setSelectedImages(images);
    setSelectedItemName(transaction.itemName);
    setShowImageModal(true);
  };

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.loan.getTransactionHistory();
      
      if (response.success && response.data) {
        // Transform the API response to match the UI structure
        const transformedHistory = response.data.map((log, index) => {
          // Extract transaction type and status from action
          let type = 'OTHER';
          let status = 'COMPLETED';
          let amount = extractAmount(log.remarks) || 0;
          
          if (log.action.includes('CREATED') || log.action.includes('PAWN')) {
            type = 'PAWN';
            status = 'COMPLETED';
          } else if (log.action.includes('PAID') || log.action.includes('REDEEM')) {
            type = 'REDEEM';
            status = 'COMPLETED';
          } else if (log.action.includes('RENEW')) {
            type = 'RENEW';
            status = 'COMPLETED';
            // For renewals, extract renewal fee
            amount = extractRenewalFee(log.remarks) || 0;
          } else if (log.action.includes('FORFEIT')) {
            type = 'FORFEIT';
            status = 'COMPLETED';
            amount = 0; // No amount for forfeitures
          }
          
          // Override status for pending transactions
          if (log.action.includes('PENDING')) {
            status = 'PENDING';
          } else if (log.action.includes('REJECT')) {
            status = 'REJECTED';
          }
          
          return {
            id: log.logId,
            transactionId: `TXN-${new Date(log.timestamp).getFullYear()}-${String(log.logId).padStart(3, '0')}`,
            itemName: extractItemName(log.remarks) || 'Unknown Item',
            type: type,
            amount: amount,
            status: status,
            date: new Date(log.timestamp).toLocaleDateString('en-GB'),
            description: log.remarks,
            photos: log.photos
          };
        });
        
        setHistoryData(transformedHistory);
        
        if (transformedHistory.length === 0) {
          notify.notifyInfo('No transaction history found.');
        } else {
          notify.notifySuccess(`✅ Loaded ${transformedHistory.length} transaction(s)`);
        }
      } else {
        console.error('❌ API response error:', response);
        notify.notifyError('Failed to load transaction history: ' + (response.message || 'Unknown error'));
        setHistoryData([]);
      }
    } catch (error) {
      console.error('❌ Network error fetching transaction history:', error);
      notify.notifyError('Network error loading transaction history: ' + error.message);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract item name from remarks
  const extractItemName = (remarks) => {
    if (!remarks) return null;
    const itemMatch = remarks.match(/item:\s*([^(]+)/);
    return itemMatch ? itemMatch[1].trim() : null;
  };

  // Helper function to extract amount from remarks
  const extractAmount = (remarks) => {
    if (!remarks) return 0;
    
    // Look for requested amount first (highest priority)
    const requestedAmountMatch = remarks.match(/Requested\s*amount:\s*₱([0-9,.]+)/i);
    if (requestedAmountMatch) {
      return parseFloat(requestedAmountMatch[1].replace(/,/g, ''));
    }
    
    // Look for other amount patterns
    const amountPatterns = [
      /₱([0-9,]+(?:\.[0-9]{2})?)/,
      /amount:\s*([0-9,]+(?:\.[0-9]{2})?)/i,
      /loan\s*amount:\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    ];
    
    for (const pattern of amountPatterns) {
      const match = remarks.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
    
    return 0;
  };

  // Helper function to extract renewal fee from remarks
  const extractRenewalFee = (remarks) => {
    if (!remarks) return 0;
    
    const feeMatch = remarks.match(/fee:\s*₱([0-9,]+(?:\.[0-9]{2})?)/i);
    if (feeMatch) {
      return parseFloat(feeMatch[1].replace(/,/g, ''));
    }
    
    return 50; // Default renewal fee
  };

  const filteredHistory = historyData.filter(item => {
    if (searchTerm.trim() === '') {
      return true; // Show all items when search is empty
    }
    return item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getTypeColor = (type) => {
    switch(type) {
      case 'PAWN': return 'type-pawn';
      case 'REDEEM': return 'type-redeem';
      case 'RENEW': return 'type-renew';
      case 'FORFEIT': return 'type-forfeit';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'status-completed';
      case 'PENDING': return 'status-pending';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  };

  return (
    <div className="history-page">
      <Navbar />
      
      <div className="history-content">
        <Header />

        <div className="history-header">
          <div className="history-title-row">
            <div className="history-title-section">
              <h2>Transaction History</h2>
              <p>View all your past transactions and activities</p>
            </div>
            {!loading && filteredHistory.length > 0 && (
              <div className="history-inline-stats">
                <span className="transaction-count">Transactions: ({filteredHistory.length})</span>
                <button 
                  className="clear-history-btn"
                  onClick={clearAllHistory}
                  disabled={clearingHistory}
                >
                  {clearingHistory ? 'Clearing...' : 'Clear'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="history-search">
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* History List */}
        <div className="history-list">
          {loading ? (
            <div className="history-loading">
              <div className="loading-spinner"></div>
              <p>Loading transaction history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="no-history">
              <svg className="no-history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3>No transactions found</h3>
              <p>No transactions match the selected filter.</p>
            </div>
          ) : (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Images</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((transaction) => (
                    <tr key={transaction.id} className="history-row">
                      <td className="transaction-id">{transaction.transactionId}</td>
                      <td className="transaction-date">{transaction.date}</td>
                      <td className="transaction-item">{transaction.itemName}</td>
                      <td>
                        <span className={`type-badge ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="transaction-images">
                        <button 
                          className="view-image-btn"
                          onClick={() => handleViewImages(transaction)}
                          title="View item images"
                        >
                          View
                        </button>
                      </td>
                      <td className="transaction-description">{transaction.description}</td>
                      <td className="transaction-actions">
                        <button 
                          className="delete-btn"
                          onClick={() => deleteTransaction(transaction.id)}
                          disabled={deletingItems.has(transaction.id)}
                          title="Delete transaction"
                        >
                          {deletingItems.has(transaction.id) ? '...' : '×'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
      
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

export default History;
