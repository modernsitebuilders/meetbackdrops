// components/Analytics.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Analytics() {
  const router = useRouter();

  useEffect(() => {
    const trackPageView = async () => {
  // Skip tracking during build or in development
  if (typeof window === 'undefined' || 
      window.location.hostname === 'localhost') {
    return;
  }

  console.log('🔍 Analytics: trackPageView called for:', window.location.pathname);
  console.log('🔍 Analytics: referrer:', document.referrer);
  
  // Get UTM parameters from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const utm_source = urlParams.get('utm_source');
  console.log('🔍 Analytics: UTM source from URL:', utm_source);
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
            page: window.location.pathname,
            category: window.location.pathname === '/' ? 'homepage' : 
                     window.location.pathname.startsWith('/blog/') ? 'blog' :
                     window.location.pathname.startsWith('/category/') ? 'category-page' :
                     window.location.pathname.includes('/gallery') ? 'gallery' :
                     window.location.pathname.includes('/about') ? 'about' :
                     window.location.pathname.includes('/contact') ? 'contact' :
                     window.location.pathname.includes('/privacy') ? 'legal' :
                     window.location.pathname.includes('/terms') ? 'legal' :
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
    };  // <-- This closing brace should be AFTER the trackPageView function definition

    // Track initial page view
    trackPageView();

    // Track route changes
    const handleRouteChange = () => {
      trackPageView();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return null;
}