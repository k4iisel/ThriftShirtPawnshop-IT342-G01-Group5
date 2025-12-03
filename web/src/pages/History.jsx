import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import useNotify from '../hooks/useNotify';
import '../styles/History.css';

function History() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const notify = useNotify();

  useEffect(() => {
    // Simulate loading history data
    setTimeout(() => {
      // Static history data for demonstration
      const staticHistory = [
        {
          id: 1,
          transactionId: 'TXN-2024-001',
          itemName: 'Nike Air Jordan 1',
          type: 'PAWN',
          amount: 5000,
          status: 'COMPLETED',
          date: '2024-01-15',
          description: 'Item pawned successfully'
        },
        {
          id: 2,
          transactionId: 'TXN-2024-002',
          itemName: 'Adidas Ultraboost',
          type: 'REDEEM',
          amount: 5250,
          status: 'COMPLETED',
          date: '2024-02-20',
          description: 'Item redeemed with interest'
        },
        {
          id: 3,
          transactionId: 'TXN-2024-003',
          itemName: 'Supreme Box Logo Tee',
          type: 'PAWN',
          amount: 3000,
          status: 'PENDING',
          date: '2024-03-10',
          description: 'Awaiting appraisal'
        },
        {
          id: 4,
          transactionId: 'TXN-2024-004',
          itemName: 'Yeezy Boost 350',
          type: 'RENEW',
          amount: 150,
          status: 'COMPLETED',
          date: '2024-03-25',
          description: 'Loan period extended'
        },
        {
          id: 5,
          transactionId: 'TXN-2024-005',
          itemName: 'Off-White Hoodie',
          type: 'PAWN',
          amount: 4500,
          status: 'REJECTED',
          date: '2024-04-05',
          description: 'Item condition not acceptable'
        }
      ];
      setHistoryData(staticHistory);
      setLoading(false);
    }, 500);
  }, []);

  const filteredHistory = filterStatus === 'ALL' 
    ? historyData 
    : historyData.filter(item => item.status === filterStatus);

  const getTypeColor = (type) => {
    switch(type) {
      case 'PAWN': return 'type-pawn';
      case 'REDEEM': return 'type-redeem';
      case 'RENEW': return 'type-renew';
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
          <h2>Transaction History</h2>
          <p>View all your past transactions and activities</p>
        </div>

        {/* Filter Buttons */}
        <div className="history-filters">
          <button 
            className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ALL')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('COMPLETED')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilterStatus('PENDING')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('REJECTED')}
          >
            Rejected
          </button>
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
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Description</th>
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
                      <td className="transaction-amount">₱{transaction.amount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="transaction-description">{transaction.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Section */}
        {!loading && filteredHistory.length > 0 && (
          <div className="history-summary">
            <div className="summary-card">
              <div className="summary-label">Total Transactions</div>
              <div className="summary-value">{filteredHistory.length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Amount</div>
              <div className="summary-value">
                ₱{filteredHistory.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
