import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import apiService from '../services/apiService';
import useNotify from '../hooks/useNotify';
import '../styles/PawnStatus.css';

function PawnStatus() {
  const [pawns, setPawns] = useState([]);
  const [loading, setLoading] = useState(true);
  const notify = useNotify();

  useEffect(() => {
    fetchPawnRequests();
  }, []);

  const fetchPawnRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.pawnRequest.getAll();
      
      if (response.success && response.data) {
        // Transform the API response data to match the UI structure
        const transformedPawns = response.data.map((pawn, index) => ({
          pawnId: pawn.pawnId,
          itemName: pawn.itemName,
          brand: pawn.brand,
          size: pawn.size,
          category: pawn.category,
          condition: pawn.condition,
          description: pawn.description,
          status: pawn.status || 'PENDING',
          requestedAmount: pawn.requestedAmount,
          estimatedValue: pawn.estimatedValue,
          appraisalDate: pawn.appraisalDate,
          appraisedBy: pawn.appraisedBy,
          photos: pawn.photos,
          // Generate placeholder values for display
          image: 'https://via.placeholder.com/100x100?text=' + encodeURIComponent(pawn.itemName),
          submissionDate: new Date().toLocaleDateString('en-GB'), // Current date
          interestRate: 5,
          interestAmount: pawn.requestedAmount ? pawn.requestedAmount * 0.05 : 0,
          totalToRedeem: pawn.requestedAmount ? pawn.requestedAmount * 1.05 : 0,
          loanPeriod: 30,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')
        }));
        setPawns(transformedPawns);
      } else {
        notify.notifyError('Failed to load pawn requests');
      }
    } catch (error) {
      console.error('Error fetching pawn requests:', error);
      notify.notifyError('Error loading pawn requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemItem = (pawnId) => {
    alert(`Redirecting to payment for ${pawnId}...`);
    // TODO: Implement payment functionality
  };

  const handleRenewLoan = (pawnId) => {
    alert(`Renewing loan for ${pawnId}...`);
    // TODO: Implement loan renewal functionality
  };

  return (
    <div className="pawn-status-page">
      <Navbar />
      
      <div className="pawn-status-content">
        <Header />

        <div className="status-header">
          <h2>Pawn Status</h2>
          <p>Track your pawn requests and loans</p>
        </div>

        <div className="pawns-list">
          {loading ? (
            <div className="no-pawns">
              <h3>Loading...</h3>
              <p>Please wait while we fetch your pawn requests.</p>
            </div>
          ) : pawns.length === 0 ? (
            <div className="no-pawns">
              <h3>No pawns found</h3>
              <p>You don't have any pawn requests at the moment.</p>
            </div>
          ) : (
            pawns.map((pawn, index) => (
              <div key={`${pawn.pawnId}-${index}`} className="pawn-card">
                <div className="pawn-header">
                  <div className="item-image">
                    <img src={pawn.image} alt={pawn.itemName} />
                  </div>
                  <div className="item-info">
                    <h3>{pawn.itemName}</h3>
                    <p className="loan-id">Pawn ID: {pawn.pawnId}</p>
                    <span className={`status-badge ${pawn.status.toLowerCase()}`}>
                      {pawn.status}
                    </span>
                  </div>
                </div>

                <div className="loan-details">
                  <p className="submission-date">Submitted: {pawn.submissionDate}</p>
                  <p className="item-condition">Condition: {pawn.condition}</p>
                  <p className="item-size">Size: {pawn.size}</p>
                  {pawn.description && <p className="item-description">{pawn.description}</p>}
                  
                  <div className="financial-summary">
                    <div className="summary-row">
                      <span>Requested Amount:</span>
                      <span className="amount">₱{pawn.requestedAmount ? pawn.requestedAmount.toFixed(2) : '0.00'}</span>
                    </div>
                    {pawn.estimatedValue && (
                      <div className="summary-row">
                        <span>Estimated Value:</span>
                        <span className="amount">₱{pawn.estimatedValue.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>Interest ({pawn.interestRate}%):</span>
                      <span className="amount">₱{pawn.interestAmount.toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total to Redeem:</span>
                      <span className="amount">₱{pawn.totalToRedeem.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Loan Period</span>
                      <span className="period">{pawn.loanPeriod} days</span>
                    </div>
                  </div>

                  <p className="due-date">Due Date: {pawn.dueDate}</p>
                </div>

                <div className="pawn-actions">
                  <button 
                    className="redeem-btn"
                    onClick={() => handleRedeemItem(pawn.pawnId)}
                  >
                    Redeem Item
                  </button>
                  <button 
                    className="renew-btn"
                    onClick={() => handleRenewLoan(pawn.pawnId)}
                  >
                    Renew Loan
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PawnStatus;