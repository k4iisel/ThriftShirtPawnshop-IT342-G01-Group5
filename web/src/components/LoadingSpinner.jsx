import React from 'react';

const LoadingSpinner = ({ 
  text = "Loading...", 
  size = "medium", 
  centered = true 
}) => {
  const sizeClass = {
    small: "loading-spinner-small",
    medium: "loading-spinner",
    large: "loading-spinner-large"
  }[size];

  if (centered) {
    return (
      <div className="admin-loading">
        <div className={sizeClass}></div>
        <div className="loading-text">{text}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div className={`${sizeClass} centered`}></div>
      <span className="loading-text">{text}</span>
    </div>
  );
};

export default LoadingSpinner;