export default function PopularBadge() {
  return (
    <div style={{
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      color: 'white',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)',
      zIndex: 10
    }}>
      ⭐ Top 10
    </div>
  );
}