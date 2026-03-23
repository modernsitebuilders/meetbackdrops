export default function RateLimitModal({ onClose, errorMessage }) {
  const isDaily = errorMessage?.includes('Daily download limit');
  const isMonthly = errorMessage?.includes('Monthly download limit');
  
  const daysMatch = errorMessage?.match(/(\d+) day/);
  const daysRemaining = daysMatch ? daysMatch[1] : '?';

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0.25rem',
            lineHeight: 1
          }}
        >
          ×
        </button>

        <div style={{
          fontSize: '4rem',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          ⏱️
        </div>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          {isDaily ? 'Daily Download Limit Reached' : 'Monthly Download Limit Reached'}
        </h2>

        <p style={{
          color: '#4b5563',
          fontSize: '1rem',
          lineHeight: '1.6',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          {isDaily ? (
            <>Thank you for loving our backgrounds! 🎉 To keep this free for everyone, we have a daily limit of 5 downloads. Come back tomorrow for more!</>
          ) : (
            <>You have reached your monthly limit of 10 downloads. Your oldest download will expire in <strong>{daysRemaining} day{daysRemaining !== '1' ? 's' : ''}</strong>, then you can download more!</>
          )}
        </p>

        <div style={{
          background: '#eff6ff',
          border: '2px solid #3b82f6',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            fontSize: '0.9rem',
            color: '#1e40af',
            fontWeight: '600',
            marginBottom: '0.75rem'
          }}>
            📋 Fair Use Limits
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            color: '#1e3a8a',
            fontSize: '0.9rem',
            lineHeight: '1.8'
          }}>
            <li><strong>Daily:</strong> 5 downloads per day</li>
            <li><strong>Monthly:</strong> 10 downloads per 30-day period</li>
            <li><strong>Note:</strong> Downloads expire after 30 days</li>
          </ul>
        </div>

        <div style={{
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            fontSize: '0.9rem',
            color: '#92400e',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            💼 Need More Downloads?
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: '#78350f',
            margin: 0,
            lineHeight: '1.6'
          }}>
            If you need unlimited downloads for your business or organization, please contact us about commercial licensing options.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexDirection: 'row'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#2563eb';
            }}
          >
            Got It
          </button>
          
          <a
            href={isDaily ? "/hd" : "/contact"}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#2563eb',
              border: '2px solid #2563eb',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.2s',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
            }}
         >
            {isDaily ? "View HDs" : "Contact Us"}
          </a>
        </div>
      </div>
    </div>
  );
}