import { useState } from 'react';
import '../styles/ImageModal.css';

function ImageModal({ images, itemName, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="image-modal-header">
          <span className="image-counter">
            {currentImageIndex + 1} : {images.length}
          </span>
        </div>
        
        <div className="image-modal-body">
          {images.length > 1 && (
            <button className="image-nav prev" onClick={prevImage}>
              ‹
            </button>
          )}
          
          <img 
            src={images[currentImageIndex]} 
            alt={`Image ${currentImageIndex + 1}`}
            className="modal-main-image"
          />
          
          {images.length > 1 && (
            <button className="image-nav next" onClick={nextImage}>
              ›
            </button>
          )}
        </div>
        
        {images.length > 1 && (
          <div className="image-thumbnails">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageModal;