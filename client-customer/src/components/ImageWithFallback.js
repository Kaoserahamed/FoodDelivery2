import React, { useState } from 'react';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  fallbackText,
  fallbackType = 'restaurant' // 'restaurant' or 'food'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Check if image source is valid (not placeholder or empty)
  const isValidImage = src && 
    !src.includes('/api/placeholder') && 
    !src.includes('placeholder') && 
    src !== '' && 
    src !== null && 
    src !== undefined;

  const shouldShowFallback = !isValidImage || imageError;

  if (shouldShowFallback) {
    // Fallback styling based on type
    const fallbackStyle = {
      ...style,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: fallbackType === 'restaurant' ? 'var(--primary-color)' : 'var(--secondary-color)',
      color: 'var(--white)',
      fontSize: fallbackType === 'restaurant' ? 'var(--font-size-xl)' : 'var(--font-size-lg)',
      fontWeight: 'var(--font-weight-bold)',
      textAlign: 'center',
      padding: 'var(--spacing-md)',
      lineHeight: '1.2',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      background: fallbackType === 'restaurant' 
        ? 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)'
        : 'linear-gradient(135deg, var(--secondary-color) 0%, var(--accent-color) 100%)',
      position: 'relative',
      overflow: 'hidden'
    };

    // Add decorative elements
    const decorativeStyle = {
      position: 'absolute',
      top: '10px',
      right: '10px',
      fontSize: 'var(--font-size-2xl)',
      opacity: '0.3'
    };

    return (
      <div className={className} style={fallbackStyle}>
        <div style={decorativeStyle}>
          <i className={`fas fa-${fallbackType === 'restaurant' ? 'store' : 'utensils'}`}></i>
        </div>
        <div style={{ zIndex: 1, position: 'relative' }}>
          {fallbackText || alt || 'No Image'}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: imageLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
      onError={handleImageError}
      onLoad={handleImageLoad}
    />
  );
};

export default ImageWithFallback;