'use client';

import { useState, useEffect } from 'react';
import { getOrCreateSession, getVisitorType } from '../lib/sessionTracking';

console.log('Widget render - isOpen:', isOpen);
if (isOpen) console.log('Modal should be visible');

export default function ComparisonWidget({ standardImg, hdImg, imageId, isOpen, onClose, hdPageUrl }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showInstruction, setShowInstruction] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    window.enableAdminMode = () => {
      setIsAdmin(true);
      console.log('✓ Admin mode enabled - ComparisonWidget analytics disabled');
    };
    window.disableAdminMode = () => {
      setIsAdmin(false);
      console.log('✓ Admin mode disabled - ComparisonWidget analytics enabled');
    };
  }, []);

  // In ComparisonWidget.js - update the trackEvent function
const trackEvent = (action, label) => {
  if (isAdmin) {
    console.log('🚫 Analytics blocked (admin mode):', action, label);
    return;
  }

  const session = getOrCreateSession();

  // GA4 tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'HD Comparison Widget',
      event_label: label,
    });
  }
  
  // Google Sheets tracking with COMPLETE session data
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: action,
      filename: imageId || 'comparison-widget',
      category: 'hd',
      originalSource: session?.originalUtmSource || (typeof document !== 'undefined' ? (document.referrer || 'direct') : 'direct'),
      sessionId: session?.id || 'unknown',
      visitorId: session?.visitorId || 'unknown',
      pageViewsInSession: session?.pageViews || 0,
      downloadsInSession: session?.downloads || 0,
      visitorType: getVisitorType(),  // Add this
      landingPage: session?.landingPage || ''  // Add this
    })
  }).catch(() => {});
};

  // Track first slider drag
  useEffect(() => {
    if (sliderPosition !== 95 && showInstruction) {
      setShowInstruction(false);
      trackEvent('slider_used', `User Dragged Slider - ${imageId}`);
    }
  }, [sliderPosition, showInstruction, imageId]);

  return (
    <>
      {/* Full-Screen Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          {/* Top controls */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            gap: '10px',
            zIndex: 10000,
          }}>
            {hdPageUrl && (
              <a
                href={hdPageUrl}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#FFD700',
                  color: '#000',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                See them all
              </a>
            )}
            <button
              onClick={() => {
                onClose();
                setSliderPosition(95);
                setShowInstruction(true);
                trackEvent('widget_closed', `Comparison Modal Closed - ${imageId}`);
              }}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close ✕
            </button>
          </div>

          {/* Comparison Container */}
          <div style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden'
          }}>
            {/* Standard Image */}
            <img 
              src={standardImg}
              alt="Standard Quality"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />

            {/* HD Image */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              clipPath: `inset(0 0 0 ${sliderPosition}%)`
            }}>
              <img 
                src={hdImg}
                alt="HD Quality"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {/* Diagonal Watermark */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <span style={{
                  fontSize: '120px',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.15)',
                  transform: 'rotate(-45deg)',
                  userSelect: 'none'
                }}>
                  SAMPLE
                </span>
              </div>
            </div>

            {/* Slider Line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: `${sliderPosition}%`,
              width: '4px',
              height: '100%',
              backgroundColor: '#FFD700',
              cursor: 'ew-resize',
              transform: 'translateX(-50%)'
            }}>
              {/* Slider Handle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '50px',
                height: '50px',
                backgroundColor: '#FFD700',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#000',
                fontWeight: 'bold',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                ⟷
              </div>
            </div>

            {/* Instruction Label */}
            {showInstruction && (
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '120px',
                transform: 'translateY(80px)',
                backgroundColor: '#FFD700',
                color: '#000',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                animation: 'pulse 2s infinite',
                pointerEvents: 'none',
                zIndex: 10001,
                whiteSpace: 'nowrap'
              }}>
                ← Drag here to reveal HD quality
              </div>
            )}

            {/* Slider Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'ew-resize',
                zIndex: 10
              }}
            />

            {/* Centered label - shows which version is dominant */}
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 100,
              pointerEvents: 'none'
            }}>
              {sliderPosition > 50 ? (
                <span style={{
                  background: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '999px',
                  fontSize: '16px',
                  fontWeight: '600',
                  letterSpacing: '0.02em'
                }}>
                  Free Version
                </span>
              ) : (
                <span style={{
                  background: 'rgba(255,215,0,0.85)',
                  color: '#000',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '999px',
                  fontSize: '16px',
                  fontWeight: '700',
                  letterSpacing: '0.02em'
                }}>
                  ⭐ HD Version
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: translateY(80px) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translateY(80px) scale(1.05);
          }
        }
      `}</style>
    </>
  );
}