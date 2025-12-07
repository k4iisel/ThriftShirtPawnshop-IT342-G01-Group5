import React, { useState } from 'react';
import MemberPhotoModal from './MemberPhotoModal';
import '../styles/DevTeamModal.css';

// Import member photos
import GaringProfile from '../assets/images/Members/GaringProfile.png';
import FortalezaProfile from '../assets/images/Members/FortalezaProfile.jpg';
import GabianaProfile from '../assets/images/Members/GabianaProfile.jpg';
import MielProfile from '../assets/images/Members/MielProfile.jpg';

function DevTeamModal({ isOpen, onClose }) {
  const [selectedMember, setSelectedMember] = useState(null);
  
  if (!isOpen) return null;

  const teamMembers = [
    {
      id: 1,
      name: "Mark Christian Garing",
      role: "Frontend Developer",
      email: "markchristian.garing@cit.edu",
      github: "@k4iisel",
      photo: GaringProfile
    },
    {
      id: 2,
      name: "Dale Christian Fortaleza",
      role: "Project Manager",
      email: "dalechristian.fortaleza@cit.edu",
      github: "@daley2",
      photo: FortalezaProfile
    },
    {
      id: 3,
      name: "Nicolo Francis Gabiana",
      role: "Backend Developer",
      email: "nicolofrancis.gabiana@cit.edu",
      github: "@NFGab",
      photo: GabianaProfile
    },
    {
      id: 4,
      name: "Kaysean Miel",
      role: "Backend Developer",
      email: "kaysean.miel@cit.edu",
      github: "@kayseanmiel",
      photo: MielProfile
    }
  ];

  const handleMemberPhotoClick = (member) => {
    setSelectedMember(member);
  };

  const closeMemberModal = () => {
    setSelectedMember(null);
  };

  return (
    <>
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
              {teamMembers.map((member) => (
                <div key={member.id} className="dev-member">
                  <div 
                    className="dev-avatar dev-avatar-photo" 
                    onClick={() => handleMemberPhotoClick(member)}
                  >
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      className="dev-photo"
                    />
                  </div>
                  <h3>{member.name}</h3>
                  <p className="dev-role">{member.role}</p>
                  <p className="dev-email">{member.email}</p>
                </div>
              ))}
            </div>

            <div className="dev-team-footer">
              <p>© 2025 ThriftShirt Pawnshop Development Team</p>
            </div>
          </div>
        </div>
      </div>
      
      {selectedMember && (
        <MemberPhotoModal 
          member={selectedMember} 
          isOpen={!!selectedMember} 
          onClose={closeMemberModal} 
        />
      )}
    </>
  );
}

export default DevTeamModal;