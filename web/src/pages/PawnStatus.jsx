import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import ImageModal from '../components/ImageModal';
import apiService from '../services/apiService';
import useNotify from '../hooks/useNotify';
import '../styles/PawnStatus.css';

function PawnStatus() {
  const location = useLocation();
  const navigate = useNavigate();
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
        (p.itemName === selectedPawn.itemName)
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

        const allPawns = response.data;

        const transformedPawns = allPawns.map((pawn) => {
          // Priority: customAmount (if validated) > offeredAmount (if offer made) > 0
          // For active loans, the backend might handle loanAmount differently in the future,
          // but currently 'offeredAmount' is the key one for the offer stage.
          // If a loan is active, we might need to look at loan details, but for now assuming offeredAmount persists.
          let displayAmount = pawn.offeredAmount || 0;

          // Use values from API if available (for Active/PAWNED loans)
          const interestRate = pawn.interestRate || 5;
          const loanPeriod = pawn.proposedLoanDuration || 30;

          let dueDateStr = 'N/A';
          if (pawn.dueDate) {
            // API sends date array or string, handle accordingly. usually string from Spring Boot standard serialization
            dueDateStr = pawn.dueDate;
          } else {
            // Fallback calculation for display if not yet active but offered
            const calcDate = new Date(Date.now() + loanPeriod * 24 * 60 * 60 * 1000);
            dueDateStr = calcDate.toLocaleDateString('en-GB');
          }

          const interestAmount = displayAmount * (interestRate / 100);
          const totalToRedeem = displayAmount + interestAmount;

          return {
            pawnId: pawn.pawnId,
            itemName: pawn.itemName,
            brand: pawn.brand,
            size: pawn.size,
            category: pawn.category,
            condition: pawn.condition,
            description: pawn.description,
            status: pawn.status || 'PENDING',
            offeredAmount: pawn.offeredAmount,
            adminRemarks: pawn.adminRemarks,
            photos: pawn.photos,
            // Generate placeholder values for display
            image: 'https://via.placeholder.com/100x100?text=' + encodeURIComponent(pawn.itemName),
            submissionDate: new Date(pawn.createdAt || Date.now()).toLocaleDateString('en-GB'),
            interestRate: interestRate,
            interestAmount: interestAmount,
            totalToRedeem: totalToRedeem,
            loanPeriod,
            dueDate: dueDateStr
          };
        });
        setPawns(transformedPawns);

        if (transformedPawns.length === 0) {
          notify.notifyInfo('No pawn requests found. Create your first pawn request!');
        }
      } else {
        notify.notifyError('Failed to load pawn requests: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Network error fetching pawn requests:', error);
      notify.notifyError('Network error loading pawn requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemItem = (pawn) => {
    // In new workflow, redemption is face-to-face
    const confirmMessage = `To redeem "${pawn.itemName}", please visit our store.\n\n` +
      `Total to Pay: ₱${pawn.totalToRedeem.toFixed(2)}\n` +
      `(Includes ${pawn.interestRate}% interest)\n\n` +
      `Present this ID to the staff: ${pawn.pawnId}`;

    alert(confirmMessage);
  };

  const handleRenewLoan = async (pawn) => {
    // Renewal logic might also need to be face-to-face or simple request
    // Keeping existing "request renewal" flow for now but warning user
    if (window.confirm(`Request loan renewal for "${pawn.itemName}"? This requires admin approval.`)) {
      try {
        const response = await apiService.loan.renew(pawn.pawnId);
        if (response.success) {
          notify.notifySuccess('✅ Loan renewal requested!');
          fetchPawnRequests();
        } else {
          notify.notifyError('❌ Failed to renew loan: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        notify.notifyError('❌ Error renewing loan: ' + error.message);
      }
    }
  };

  const handleDeletePawn = async (pawnId) => {
    if (window.confirm('Are you sure you want to delete this pawn request?')) {
      try {
        const response = await apiService.pawnRequest.delete(pawnId);
        if (response.success) {
          notify.notifySuccess('✅ Pawn request deleted successfully');
          fetchPawnRequests();
        } else {
          notify.notifyError('❌ Failed to delete pawn request: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        notify.notifyError('❌ Error deleting pawn request: ' + error.message);
      }
    }
  };

  const handleRespondToOffer = async (pawnId, accept) => {
    if (!window.confirm(accept ? "Accept this offer? You will need to visit the store to receive cash." : "Decline this offer?")) {
      return;
    }
    try {
      await apiService.pawnRequest.respondToOffer(pawnId, accept);
      notify.notifySuccess(accept ? "Offer accepted! Visit us to claim your cash." : "Offer declined.");
      fetchPawnRequests();
    } catch (error) {
      notify.notifyError("Failed to update status: " + error.message);
    }
  };

  const handleViewImages = (pawn) => {
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
                      {(pawn.status === 'PENDING' || pawn.status === 'REJECTED') && (
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

                  {/* Status Badge */}
                  <div className="status-badge-container">
                    <span className={`status-badge-inline ${pawn.status.toLowerCase()}`}>
                      {pawn.status}
                    </span>
                  </div>

                  {/* Financial & Offer Details */}
                  <div className="financial-summary">

                    {/* Offer Received Section */}
                    {pawn.status === 'OFFER_MADE' && (
                      <div className="offer-section">
                        <div className="summary-row offer-highlight">
                          <span>OFFER RECEIVED:</span>
                          <span className="amount">₱{pawn.offeredAmount ? pawn.offeredAmount.toFixed(2) : '0.00'}</span>
                        </div>
                        {pawn.adminRemarks && (
                          <div className="admin-remarks">
                            <small><strong>Note from Admin:</strong> {pawn.adminRemarks}</small>
                          </div>
                        )}
                        <div className="offer-actions">
                          <button className="accept-btn" onClick={() => handleRespondToOffer(pawn.pawnId, true)}>Accept Offer</button>
                          <button className="reject-btn" onClick={() => handleRespondToOffer(pawn.pawnId, false)}>Decline</button>
                        </div>
                      </div>
                    )}

                    {(pawn.status === 'ACCEPTED') && (
                      <div className="offer-section">
                        <div className="summary-row">
                          <span>Accepted Offer:</span>
                          <span className="amount">₱{pawn.offeredAmount ? pawn.offeredAmount.toFixed(2) : '0.00'}</span>
                        </div>
                        <p className="visit-store-msg">Please visit the store to validate your item and receive cash.</p>
                      </div>
                    )}


                    {['PAWNED', 'Active', 'ACTIVE', 'REDEEMED', 'DEFAULTED'].includes(pawn.status) && (
                      <>
                        <div className="summary-row">
                          <span>Loan Amount:</span>
                          <span className="amount">₱{pawn.offeredAmount ? pawn.offeredAmount.toFixed(2) : '0.00'}</span>
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
                          <span>Due Date:</span>
                          <span>{pawn.dueDate}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {['PAWNED', 'Active', 'ACTIVE'].includes(pawn.status) && (
                  <div className="pawn-actions">
                    <button
                      className="redeem-btn"
                      onClick={() => handleRedeemItem(pawn)}
                    >
                      Redeem Item
                    </button>
                  </div>
                )}
                {/* Renew Loan button removed */}
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