import { useEffect, useRef } from 'react';
import { event } from '../lib/gtag';

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
  const playerRef = useRef(null);
  const hasStartedRef = useRef(false);
  const iframeId = `yt-player-${videoId}`;

  useEffect(() => {
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
  }, [videoId, title, iframeId]);

  return (
    <div style={{
      position: 'relative',
      paddingBottom: '56.25%',
      height: 0,
      overflow: 'hidden',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <iframe
        id={iframeId}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          border: 0,
        }}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
