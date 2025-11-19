import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import '../styles/PawnStatus.css';

function PawnStatus() {
  const [pawns, setPawns] = useState([]);

  // Mock data with detailed loan information
  const mockPawns = [
    {
      id: 'PWN-001',
      itemName: 'Vintage Shirt',
      brand: 'Vintage',
      size: 'L',
      submissionDate: '24/09/2025',
      status: 'Active Loan',
      appraisalValue: 500.00,
      loanReceived: 400.00,
      interestRate: 5,
      interestAmount: 25.00,
      totalToRedeem: 425.00,
      loanPeriod: 30,
      dueDate: '24/10/2025',
      image: 'https://via.placeholder.com/100x100?text=Vintage+Shirt'
    },
    {
      id: 'PWN-001',
      itemName: 'Rock Band Shirt',
      brand: 'Band Merch',
      size: 'M',
      submissionDate: '20/09/2025',
      status: 'Active Loan',
      appraisalValue: 350.00,
      loanReceived: 280.00,
      interestRate: 5,
      interestAmount: 17.50,
      totalToRedeem: 297.50,
      loanPeriod: 30,
      dueDate: '20/10/2025',
      image: 'https://via.placeholder.com/100x100?text=Rock+Shirt'
    }
  ];

  useEffect(() => {
    // Set pawns directly without loading state
    setPawns(mockPawns);
  }, []);

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
          {pawns.length === 0 ? (
            <div className="no-pawns">
              <h3>No pawns found</h3>
              <p>You don't have any active pawns at the moment.</p>
            </div>
          ) : (
            pawns.map((pawn, index) => (
              <div key={`${pawn.id}-${index}`} className="pawn-card">
                <div className="pawn-header">
                  <div className="item-image">
                    <img src={pawn.image} alt={pawn.itemName} />
                  </div>
                  <div className="item-info">
                    <h3>{pawn.itemName}</h3>
                    <p className="loan-id">Loan ID: {pawn.id}</p>
                    <span className="status-badge active">{pawn.status}</span>
                  </div>
                </div>

                <div className="loan-details">
                  <p className="submission-date">Submitted: {pawn.submissionDate}</p>
                  
                  <div className="financial-summary">
                    <div className="summary-row">
                      <span>Appraisal Value:</span>
                      <span className="amount">₱{pawn.appraisalValue.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Loan Received:</span>
                      <span className="amount">₱{pawn.loanReceived.toFixed(2)}</span>
                    </div>
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
                    onClick={() => handleRedeemItem(pawn.id)}
                  >
                    Redeem Item
                  </button>
                  <button 
                    className="renew-btn"
                    onClick={() => handleRenewLoan(pawn.id)}
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