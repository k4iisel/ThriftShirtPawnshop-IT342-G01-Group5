import '../styles/CashTransactionModal.css';

const CashTransactionModal = ({ isOpen, onClose, transactionType }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cash-transaction-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <div className="modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
        </div>
        <h2>{transactionType}</h2>
        <p className="modal-message">
          Please proceed to the counter to complete your {transactionType.toLowerCase()} transaction.
          Our staff will assist you with the process.
        </p>
        <div className="modal-note">
          <strong>Note:</strong> This is an over-the-counter transaction. Please bring a valid ID.
        </div>
      </div>
    </div>
  );
};

export default CashTransactionModal;
