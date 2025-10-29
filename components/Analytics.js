// components/Analytics.js
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

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

      const currentPath = window.location.pathname;
      
      // Prevent duplicate tracking for the same path within 1 second
      if (lastTrackedPath.current === currentPath && 
          Date.now() - (lastTrackedPath.currentTime || 0) < 1000) {
        console.log('🔍 Analytics: Skipping duplicate track for:', currentPath);
        return;
      }

      console.log('🔍 Analytics: Tracking page view for:', currentPath);

      // Update tracking reference
      lastTrackedPath.current = currentPath;
      lastTrackedPath.currentTime = Date.now();

      // Get UTM parameters from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const utm_source = urlParams.get('utm_source');
      const utm_medium = urlParams.get('utm_medium');
      const utm_campaign = urlParams.get('utm_campaign');
      
      // Store UTM parameters in session storage to track throughout visit
      if (utm_source) {
        sessionStorage.setItem('utm_source', utm_source);
      }
      if (utm_medium) {
        sessionStorage.setItem('utm_medium', utm_medium);
      }
      if (utm_campaign) {
        sessionStorage.setItem('utm_campaign', utm_campaign);
      }
      
      // Get stored UTM parameters (persists throughout the session)
      const stored_utm_source = sessionStorage.getItem('utm_source');
      const stored_utm_medium = sessionStorage.getItem('utm_medium');
      const stored_utm_campaign = sessionStorage.getItem('utm_campaign');

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
                     currentPath.includes('/contact') ? 'contact' :
                     currentPath.includes('/privacy') ? 'legal' :
                     currentPath.includes('/terms') ? 'legal' :
                     'other',
            referrer: document.referrer || 'direct',
            utm_source: stored_utm_source || utm_source || null,
            utm_medium: stored_utm_medium || utm_medium || null,
            utm_campaign: stored_utm_campaign || utm_campaign || null
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