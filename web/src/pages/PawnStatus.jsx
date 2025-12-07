import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import ImageModal from '../components/ImageModal';
import apiService from '../services/apiService';
import useNotify from '../hooks/useNotify';
import '../styles/PawnStatus.css';

function PawnStatus() {
  const location = useLocation();
  const [pawns, setPawns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState('');
  const [highlightedPawnId, setHighlightedPawnId] = useState(null);
  const notify = useNotify();

  // Get selected pawn from navigation state
  const selectedPawn = location.state?.selectedPawn;

  useEffect(() => {
    fetchPawnRequests();
  }, []);

  // Handle selected pawn highlighting and scrolling
  useEffect(() => {
    if (selectedPawn && pawns.length > 0) {
      // Find matching pawn by ID or other identifying fields
      const matchingPawn = pawns.find(p => 
        p.pawnId === selectedPawn.id || 
        p.id === selectedPawn.id ||
        (p.itemName === selectedPawn.itemName && p.requestedAmount === selectedPawn.requestedAmount)
      );
      
      if (matchingPawn) {
        setHighlightedPawnId(matchingPawn.pawnId || matchingPawn.id);
        
        // Auto-scroll to highlighted item after a brief delay
        setTimeout(() => {
          const element = document.getElementById(`pawn-${matchingPawn.pawnId || matchingPawn.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    }
  }, [selectedPawn, pawns]);

  const fetchPawnRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.pawnRequest.getAll();
      
      if (response.success && response.data) {
        console.log('📋 Fetched pawn requests:', response.data);
        
        // Show all pawn requests with their actual status
        const allPawns = response.data;
        
        // Transform the API response data to match the UI structure
        const transformedPawns = allPawns.map((pawn, index) => ({
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
        
        if (transformedPawns.length === 0) {
          notify.notifyInfo('No pawn requests found. Create your first pawn request!');
        } else {
          notify.notifySuccess(`✅ Loaded ${transformedPawns.length} pawn request(s)`);
        }
      } else {
        console.error('❌ API response error:', response);
        notify.notifyError('Failed to load pawn requests: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Network error fetching pawn requests:', error);
      notify.notifyError('Network error loading pawn requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemItem = async (pawn) => {
    if (window.confirm(`Are you sure you want to redeem "${pawn.itemName}"? This will complete the loan payment and return your item.`)) {
      try {
        // For now, we'll use the pawnId as a proxy to find the loan
        // In a real scenario, we'd get the loan ID from the pawn data
        const response = await apiService.loan.redeem(pawn.pawnId);
        
        if (response.success) {
          notify.notifySuccess('✅ Item redeemed successfully! Your loan has been paid.');
          // Refresh the pawn requests list
          fetchPawnRequests();
        } else {
          notify.notifyError('❌ Failed to redeem item: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('❌ Error redeeming item:', error);
        notify.notifyError('❌ Error redeeming item: ' + error.message);
      }
    }
  };

  const handleRenewLoan = async (pawn) => {
    if (window.confirm(`Are you sure you want to renew the loan for "${pawn.itemName}"? This will create a new loan with the same terms.`)) {
      try {
        // For redeemed items, create a new loan
        const response = await apiService.loan.renew(pawn.pawnId);
        
        if (response.success) {
          notify.notifySuccess('✅ New loan created successfully!');
          // Refresh the pawn requests list
          fetchPawnRequests();
        } else {
          notify.notifyError('❌ Failed to create new loan: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('❌ Error creating new loan:', error);
        notify.notifyError('❌ Error creating new loan: ' + error.message);
      }
    }
  };



  const handleDeletePawn = async (pawnId) => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this pawn request? This action cannot be undone.')) {
      try {
        const response = await apiService.pawnRequest.delete(pawnId);
        
        if (response.success) {
          notify.notifySuccess('✅ Pawn request deleted successfully');
          // Refresh the pawn requests list
          fetchPawnRequests();
        } else {
          notify.notifyError('❌ Failed to delete pawn request: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('❌ Error deleting pawn request:', error);
        notify.notifyError('❌ Error deleting pawn request: ' + error.message);
      }
    }
  };

  const handleViewImages = (pawn) => {
    // Parse photos from JSON string or use placeholder
    let images = [];
    try {
      if (pawn.photos && typeof pawn.photos === 'string') {
        images = JSON.parse(pawn.photos);
      } else if (Array.isArray(pawn.photos)) {
        images = pawn.photos;
      }
    } catch (error) {
      console.error('Error parsing photos:', error);
    }
    
    // If no images, use placeholder
    if (images.length === 0) {
      images = [pawn.image || `https://via.placeholder.com/400x400?text=${encodeURIComponent(pawn.itemName)}`];
    }
    
    setSelectedImages(images);
    setSelectedItemName(pawn.itemName);
    setShowImageModal(true);
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
              <div 
                key={`${pawn.pawnId}-${index}`} 
                id={`pawn-${pawn.pawnId || pawn.id}`}
                className={`pawn-card ${highlightedPawnId === (pawn.pawnId || pawn.id) ? 'highlighted' : ''}`}
              >
                <div className="pawn-header">
                  <div className="item-info">
                    <div className="item-title-row">
                      <h3>{pawn.itemName}</h3>
                      {pawn.status === 'PENDING' && (
                        <button 
                          className="delete-icon-btn"
                          onClick={() => handleDeletePawn(pawn.pawnId)}
                          title="Delete this pawn request"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <button 
                      className="view-images-btn"
                      onClick={() => handleViewImages(pawn)}
                      title="Click to view item images"
                    >
                      View Images
                    </button>
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

                  <div className="due-date-row">
                    <p className="due-date">Due Date: {pawn.dueDate}</p>
                    <span className={`status-badge-inline ${pawn.status.toLowerCase()}`}>
                      {pawn.status === 'PENDING' ? 'PENDING' : 
                       pawn.status === 'APPROVED' ? 'APPROVED' : 
                       pawn.status === 'REJECTED' ? 'REJECTED' : 
                       pawn.status === 'PAWNED' ? 'PAWNED' :
                       pawn.status === 'REDEEMED' ? 'REDEEMED' : 
                       pawn.status === 'FORFEITED' ? 'FORFEITED' : pawn.status}
                    </span>
                  </div>
                </div>

                {pawn.status === 'PAWNED' && (
                  <div className="pawn-actions">
                    <button 
                      className="redeem-btn"
                      onClick={() => handleRedeemItem(pawn)}
                    >
                      Redeem Item
                    </button>
                  </div>
                )}
                {pawn.status === 'REDEEMED' && (
                  <div className="pawn-actions">
                    <button 
                      className="renew-btn"
                      onClick={() => handleRenewLoan(pawn)}
                    >
                      Renew Loan
                    </button>
                  </div>
                )}
                {pawn.status === 'REJECTED' && (
                  <div className="status-message-container">
                    <div className="status-message">
                      This request was rejected
                    </div>
                  </div>
                )}


              </div>
            ))
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

export default PawnStatus;