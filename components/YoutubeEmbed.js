import { useEffect, useRef, useState } from 'react';
import { event } from '../lib/gtag';
import { getOrCreateSession, getOrCreateVisitorId, getVisitorType } from '../lib/sessionTracking';

// Module-level state so the YT API script is only loaded once
let ytApiLoaded = false;
let ytApiLoading = false;
const pendingCallbacks = [];

function loadYouTubeAPI(callback) {
  if (ytApiLoaded) {
    callback();
    return;
  }
  pendingCallbacks.push(callback);
  if (ytApiLoading) return;
  ytApiLoading = true;

  const prevOnReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    ytApiLoaded = true;
    if (prevOnReady) prevOnReady();
    pendingCallbacks.forEach(cb => cb());
    pendingCallbacks.length = 0;
  };

  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
}

export default function YoutubeEmbed({ videoId, title }) {
  // Facade: nothing from youtube.com loads until the user clicks play. This keeps
  // the ~780 KiB iframe API, its main-thread cost, the i.ytimg preconnect, and the
  // third-party cookies off the initial page load. Tracking still fires once the
  // real player is mounted (video_start on PLAYING, etc.).
  const [activated, setActivated] = useState(false);
  const playerRef = useRef(null);
  const hasStartedRef = useRef(false);
  const iframeId = `yt-player-${videoId}`;

  useEffect(() => {
    if (!activated) return;
    let isMounted = true;

    loadYouTubeAPI(() => {
      if (!isMounted) return;

      playerRef.current = new window.YT.Player(iframeId, {
        events: {
          onStateChange: (e) => {
            const state = window.YT.PlayerState;
            if (e.data === state.PLAYING) {
              if (!hasStartedRef.current) {
                hasStartedRef.current = true;
                event('video_start', { video_title: title, video_id: videoId });

                // Track first play to Sheets analytics queue
                try {
                  const session = getOrCreateSession();
                  fetch('/api/track-video-play', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      videoId,
                      videoTitle: title,
                      page: window.location.pathname,
                      sessionId: session?.id || null,
                      originalReferrer: session?.originalReferrer || 'direct',
                      originalUtmSource: session?.originalUtmSource || null,
                      originalUtmMedium: session?.originalUtmMedium || null,
                      originalUtmCampaign: session?.originalUtmCampaign || null,
                      landingPage: session?.landingPage || null,
                      pageViewsInSession: session?.pageViews || 0,
                      downloadsInSession: session?.downloads || 0,
                      visitorId: getOrCreateVisitorId(),
                      visitorType: getVisitorType(),
                    }),
                  }).catch(() => {});
                } catch (e) {}
              } else {
                event('video_resume', { video_title: title, video_id: videoId });
              }
            } else if (e.data === state.PAUSED) {
              event('video_pause', { video_title: title, video_id: videoId });
            } else if (e.data === state.ENDED) {
              event('video_complete', { video_title: title, video_id: videoId });
            }
          },
        },
      });
    });

    return () => {
      isMounted = false;
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [activated, videoId, title, iframeId]);

  return (
    <div style={{
      position: 'relative',
      paddingBottom: '56.25%',
      height: 0,
      overflow: 'hidden',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      {activated ? (
        <iframe
          id={iframeId}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            border: 0,
          }}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActivated(true)}
          aria-label={`Play video: ${title}`}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            padding: 0,
            border: 0,
            cursor: 'pointer',
            background: '#000',
          }}
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`; }}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {/* Play button overlay */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '68px', height: '48px',
              borderRadius: '12px',
              background: 'rgba(17, 24, 39, 0.78)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{
              display: 'block',
              width: 0, height: 0,
              marginLeft: '4px',
              borderTop: '11px solid transparent',
              borderBottom: '11px solid transparent',
              borderLeft: '18px solid #fff',
            }} />
          </span>
        </button>
      )}
    </div>
  );
}
