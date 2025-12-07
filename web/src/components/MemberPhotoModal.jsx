import React from 'react';
import '../styles/MemberPhotoModal.css';

function MemberPhotoModal({ isOpen, onClose, member }) {
  if (!isOpen || !member) return null;

  return (
    <div className="member-photo-modal-backdrop" onClick={onClose}>
      <div className="member-photo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="member-photo-modal-header">
          <h2>{member.github || member.name}</h2>
          <button className="member-photo-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="member-photo-modal-content">
          <div className="member-photo-container">
            <img 
              src={member.photo} 
              alt={member.name}
              className="member-photo-large"
            />
          </div>
          
          <div className="member-info">
            <h3>{member.name}</h3>
            <p className="member-role-large">{member.role}</p>
            <p className="member-email-large">{member.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberPhotoModal;