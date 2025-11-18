// components/Analytics.js
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getOrCreateSession, updateSessionActivity } from '../lib/sessionTracking';

export default function Analytics() {
  const router = useRouter();
  const lastTrackedPath = useRef(null);

  useEffect(() => {
    const trackPageView = async () => {
      // Skip tracking during build or in development
      if (typeof window === 'undefined' || 
          window.location.hostname === 'localhost') {
        return;
      }
      if (localStorage.getItem('streambackdrops_admin') === 'true') {
        console.log('📊 Analytics: Skipping - Admin mode enabled');
        return;
      }

      const currentPath = window.location.pathname;
      
      // Prevent duplicate tracking for the same path within 1 second
      if (lastTrackedPath.current === currentPath && 
          Date.now() - (lastTrackedPath.currentTime || 0) < 1000) {
        console.log('📊 Analytics: Skipping duplicate track for:', currentPath);
        return;
      }

      console.log('📊 Analytics: Tracking page view for:', currentPath);

      // Update tracking reference
      lastTrackedPath.current = currentPath;
      lastTrackedPath.currentTime = Date.now();

      // Get or create session
      const session = getOrCreateSession();
      
      // Update session activity counter
      updateSessionActivity('page_view');

      // Get current page UTM parameters (for new campaigns)
      const urlParams = new URLSearchParams(window.location.search);
      const currentUtmSource = urlParams.get('utm_source');
      const currentUtmMedium = urlParams.get('utm_medium');
      const currentUtmCampaign = urlParams.get('utm_campaign');

      try {
        await fetch('/api/track-page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            page: currentPath,
            category: currentPath === '/' ? 'homepage' : 
                     currentPath.startsWith('/blog/') ? 'blog' :
                     currentPath.startsWith('/category/') ? 'category-page' :
                     currentPath.includes('/gallery') ? 'gallery' :
                     currentPath.includes('/about') ? 'about' :
                     currentPath.includes('/contact') ? 'contact-page' :
                     currentPath.includes('/privacy') ? 'legal' :
                     currentPath.includes('/terms') ? 'legal' :
                     'other',
            
            // Current page context
            referrer: document.referrer || 'direct',
            utm_source: currentUtmSource || null,
            utm_medium: currentUtmMedium || null,
            utm_campaign: currentUtmCampaign || null,
            
            // Original session attribution
            sessionId: session?.id || null,
            originalReferrer: session?.originalReferrer || 'direct',
            originalUtmSource: session?.originalUtmSource || null,
            originalUtmMedium: session?.originalUtmMedium || null,
            originalUtmCampaign: session?.originalUtmCampaign || null,
            landingPage: session?.landingPage || currentPath,
            pageViewsInSession: session?.pageViews || 1,
            downloadsInSession: session?.downloads || 0
          })
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    // Track initial page view only
    trackPageView();

    // Track route changes
    const handleRouteChange = (url) => {
      // Small delay to ensure the route has fully changed
      setTimeout(() => {
        trackPageView();
      }, 100);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return null;
}