// components/CTAButton.js
export default function CTAButton({ 
  href, 
  text, 
  variant = 'primary', 
  onClick,
  className = '' 
}) {
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
    fontFamily: 'inherit'
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
    },
    secondary: {
      background: 'white',
      color: '#2563eb',
      border: '2px solid #2563eb'
    },
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white'
    }
  };

  const styles = { ...baseStyles, ...variants[variant] };

  if (href) {
    return (
      <a href={href} style={styles} className={className}>
        {text}
      </a>
    );
  }

  return (
    <button onClick={onClick} style={styles} className={className}>
      {text}
    </button>
  );
}