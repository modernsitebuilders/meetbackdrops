// lib/sessionTracking.js
// This utility manages session tracking and preserves original attribution

const SESSION_KEY = 'sb_session';
const VISITOR_KEY = 'sb_visitor_id';
const FIRST_VISIT_KEY = 'sb_first_visit';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export function getOrCreateSession() {
  if (typeof window === 'undefined') return null;

  const now = Date.now();
  let session = null;

  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      session = JSON.parse(stored);
      
      // Check if session is still valid (within 30 minutes)
      if (now - session.startTime < SESSION_DURATION) {
        // Update last activity time
        session.lastActivity = now;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
      }
    }
  } catch (e) {
    console.error('Failed to parse session:', e);
  }

  // Create new session
  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer || 'direct';
  
  session = {
    id: generateSessionId(),
    visitorId: getOrCreateVisitorId(),
    startTime: now,
    lastActivity: now,
    
    // Original attribution (preserved throughout session)
    originalReferrer: referrer,
    originalUtmSource: urlParams.get('utm_source') || extractSourceFromReferrer(referrer),
    originalUtmMedium: urlParams.get('utm_medium') || null,
    originalUtmCampaign: urlParams.get('utm_campaign') || null,
    
    // Landing page
    landingPage: window.location.pathname,
    
    // Counters
    pageViews: 0,
    downloads: 0
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function updateSessionActivity(eventType) {
  if (typeof window === 'undefined') return;

  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const session = JSON.parse(stored);
      session.lastActivity = Date.now();
      
      // Increment counters
      if (eventType === 'page_view') {
        session.pageViews = (session.pageViews || 0) + 1;
      } else if (eventType === 'download') {
        session.downloads = (session.downloads || 0) + 1;
      }
      
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.error('Failed to update session:', e);
  }
}

export function getSessionData() {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to get session data:', e);
  }
  
  return null;
}

function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function extractSourceFromReferrer(referrer) {
  if (!referrer || referrer === 'direct') return 'direct';
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.replace('www.', '');
    
    // Map common domains to source names
    if (hostname.includes('google.com')) return 'google';
    if (hostname.includes('bing.com')) return 'bing';
    if (hostname.includes('duckduckgo.com')) return 'duckduckgo';
    if (hostname.includes('yahoo.com')) return 'yahoo';
    if (hostname.includes('chatgpt.com')) return 'chatgpt';
    if (hostname.includes('free-for.dev')) return 'free-for.dev';
    
    return hostname;
  } catch (e) {
    return 'direct';
  }
}

export function getOrCreateVisitorId() {
  if (typeof window === 'undefined') return null;
  
  try {
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(VISITOR_KEY, visitorId);
      localStorage.setItem(FIRST_VISIT_KEY, Date.now().toString());
    }
    return visitorId;
  } catch (e) {
    return null;
  }
}

export function isReturningVisitor() {
  if (typeof window === 'undefined') return false;
  
  try {
    const firstVisit = localStorage.getItem(FIRST_VISIT_KEY);
    if (!firstVisit) return false;
    
    // Returning if first visit was more than 1 hour ago
    return (Date.now() - parseInt(firstVisit)) > (60 * 60 * 1000);
  } catch (e) {
    return false;
  }
}