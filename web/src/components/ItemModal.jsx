import { useState, useEffect } from 'react';
import '../styles/ItemModal.css';

function ItemModal({ item, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Sample images - in a real app, these would come from your backend
  const itemImages = [
    item.image,
    `https://via.placeholder.com/600x600?text=${encodeURIComponent(item.name)}+1`,
    `https://via.placeholder.com/600x600?text=${encodeURIComponent(item.name)}+2`,
  ];

  // Auto-advance images every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === itemImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000);
    
    return () => clearInterval(interval);
  }, [itemImages.length]);

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <div className="image-slider">
          <img 
            src={itemImages[currentImageIndex]} 
            alt={item.name}
            className="modal-image"
          />
          <div className="image-dots">
            {itemImages.map((_, index) => (
              <span 
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>
        
        <div className="modal-details">
          <h2>{item.name}</h2>
          <p className="price">{item.price}</p>
          <p className="condition">Condition: {item.condition}</p>
        </div>
      </div>
    </div>
  );
}

export default ItemModal;
