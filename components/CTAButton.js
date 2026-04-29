// components/CTAButton.js
import { useState } from 'react';

export default function CTAButton({ 
  href, 
  text, 
  variant = 'primary', 
  onClick,
  className = '' 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = {
    display: 'inline-block',
    padding: '0.875rem 2rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    fontSize: '1rem',
    textDecoration: 'none',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    transform: isHovered ? 'translateY(-2px)' : 'none',
    boxShadow: isHovered ? '0 8px 15px rgba(0, 0, 0, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const variants = {
    primary: {
      background: '#111827',
      color: 'white',
      boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
      ':hover': {
        background: '#000'
      }
    },
    secondary: {
      background: 'white',
      color: '#111827',
      border: '2px solid #111827',
      ':hover': {
        background: '#111827',
        color: 'white'
      }
    },
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
      ':hover': {
        background: 'linear-gradient(135deg, #059669, #047857)'
      }
    }
  };

  const getVariantStyles = () => {
    const variantStyle = variants[variant];
    
    if (isHovered) {
      if (variant === 'secondary') {
        return {
          ...variantStyle,
          background: '#111827',
          color: 'white'
        };
      }
      // For gradient variants, we darken the gradient on hover
      if (variant === 'primary') {
        return {
          ...variantStyle,
          background: '#000'
        };
      }
      if (variant === 'success') {
        return {
          ...variantStyle,
          background: 'linear-gradient(135deg, #059669, #047857)'
        };
      }
    }
    
    return variantStyle;
  };

  const styles = { 
    ...baseStyles, 
    ...getVariantStyles(),
    boxShadow: isHovered ? '0 8px 15px rgba(0, 0, 0, 0.15)' : baseStyles.boxShadow
  };

  const buttonProps = {
    style: styles,
    className,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onClick: onClick
  };

  if (href) {
    return (
      <a href={href} {...buttonProps}>
        {text}
      </a>
    );
  }

  return (
    <button {...buttonProps}>
      {text}
    </button>
  );
}