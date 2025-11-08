import { useState } from 'react';

export default function ReviewModal({ onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const getResponseMessage = (stars) => {
    switch(stars) {
      case 5:
        return {
          emoji: '🎉',
          title: 'Awesome!',
          message: "We're thrilled you love it!",
          fieldPrompt: 'Want to tell others what you loved?'
        };
      case 4:
        return {
          emoji: '😊',
          title: 'Thanks!',
          message: "Glad you like it! Almost perfect.",
          fieldPrompt: 'What would make it 5 stars?'
        };
      case 3:
        return {
          emoji: '👍',
          title: 'Thanks for the feedback',
          message: "We appreciate your honesty.",
          fieldPrompt: 'How can we do better?'
        };
      case 2:
        return {
          emoji: '😕',
          title: 'Sorry to hear that',
          message: "Help us improve - what went wrong?",
          fieldPrompt: 'Tell us what disappointed you'
        };
      case 1:
        return {
          emoji: '😞',
          title: 'We apologize',
          message: "We really want to fix this. What happened?",
          fieldPrompt: 'Please tell us what went wrong'
        };
      default:
        return {
          emoji: '✅',
          title: 'Thank You!',
          message: 'Your feedback helps us improve.',
          fieldPrompt: 'Want to add more details?'
        };
    }
  };

  const handleStarClick = async (starRating) => {
    setRating(starRating);
    
    // Immediately submit the rating
    try {
      await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: starRating,
          comment: 'No comment provided',
          name: 'Anonymous',
          email: 'Not provided',
          date: new Date().toISOString()
        })
      });

      // Show thank you and optional fields
      setShowThankYou(true);
      setTimeout(() => setShowOptionalFields(true), 500);
      
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleAddDetails = async () => {
    // Update the review with additional details
    try {
      await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment || 'No comment provided',
          name: name || 'Anonymous',
          email: email || 'Not provided',
          date: new Date().toISOString()
        })
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating review:', error);
      onClose();
    }
  };

  const response = getResponseMessage(rating);

  if (showThankYou) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          maxWidth: '450px',
          width: '100%',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ textAlign: 'center', marginBottom: showOptionalFields ? '1rem' : '0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{response.emoji}</div>
            <h2 style={{ 
              color: rating >= 4 ? '#10b981' : rating === 3 ? '#6b7280' : '#f59e0b', 
              marginBottom: '0.5rem', 
              fontSize: '1.3rem' 
            }}>
              {response.title}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{response.message}</p>
          </div>

          {showOptionalFields && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0', paddingTop: '1rem' }}>
                <p style={{ 
                  color: rating <= 2 ? '#dc2626' : '#6b7280', 
                  fontSize: '0.9rem', 
                  marginBottom: '0.75rem', 
                  textAlign: 'center',
                  fontWeight: rating <= 2 ? '600' : 'normal'
                }}>
                  {response.fieldPrompt}
                </p>

                <div style={{ marginBottom: '0.75rem' }}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={rating <= 2 ? "We really want to hear from you..." : "Your thoughts (optional)"}
                    rows={rating <= 2 ? 3 : 2}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      border: rating <= 2 ? '2px solid #fca5a5' : '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {rating >= 4 && (
                  <div style={{
                    backgroundColor: '#eff6ff',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    border: '1px solid #bfdbfe'
                  }}>
                    <p style={{ fontSize: '0.8rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
                      📬 Get notified about new backgrounds (optional)
                    </p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        border: '1px solid #93c5fd',
                        borderRadius: '0.5rem',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        backgroundColor: 'white'
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddDetails}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      backgroundColor: rating <= 2 ? '#dc2626' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {rating <= 2 ? 'Send Feedback' : 'Add Details'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showOptionalFields && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '0.65rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        animation: 'slideIn 0.3s ease-out',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          How'd We Do?
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Just click a star!
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '3rem',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform 0.2s',
                color: star <= rating ? '#fbbf24' : '#d1d5db'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.15)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              ⭐
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: 'none',
            fontSize: '0.85rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Maybe later
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}