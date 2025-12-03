import React from 'react';
import '../styles/DevTeamModal.css';

function DevTeamModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="dev-team-modal-backdrop" onClick={onClose}>
      <div className="dev-team-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dev-team-modal-header">
          <h2>Development Team</h2>
          <button className="dev-team-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="dev-team-modal-content">
          <div className="dev-team-grid">
            <div className="dev-member">
              <div className="dev-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Mark Christian Garing</h3>
              <p className="dev-role">Frontend Developer</p>
              <p className="dev-email">markchristian.garing@cit.edu</p>
            </div>

            <div className="dev-member">
              <div className="dev-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Kaysean Miel</h3>
              <p className="dev-role">Backend Developer</p>
              <p className="dev-email">	kaysean.miel@cit.edu</p>
            </div>

            <div className="dev-member">
              <div className="dev-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Nicolo Francis Gabiana</h3>
              <p className="dev-role">Backend Developer</p>
              <p className="dev-email">nicolofrancis.gabiana@cit.edu</p>
            </div>

            <div className="dev-member">
              <div className="dev-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Dale Christian Fortaleza</h3>
              <p className="dev-role">Project Manager</p>
              <p className="dev-email">dalechristian.fortaleza@cit.edu</p>
            </div>
          </div>

          <div className="dev-team-footer">
            <p>© 2025 ThriftShirt Pawnshop Development Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DevTeamModal;