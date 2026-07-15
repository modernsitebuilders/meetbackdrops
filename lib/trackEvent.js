// lib/trackEvent.js
//
// Shared client-side analytics helper for ad-hoc events posted to /api/analytics
// (clicks, wishlist actions, HD/upsell interactions, etc.).
//
// It replaces the ~8 copy-pasted `trackAnalytics(eventType, filename, category)`
// helpers that posted only { eventType, filename, category } (a few also added a
// bare originalSource). Those rows landed in the log with EMPTY session/visitor
// columns, so they could not be attributed to a session or joined to the
// view→preview→download funnel. This enriches every event with the same session +
// visitor + attribution fields the page-view/preview/download trackers already
// send and that /api/analytics (pages/api/analytics.js) already reads.
//
// Fire-and-forget and SSR-safe: no-ops on the server and never throws, so a
// tracking hiccup can't break a click handler.

import { getOrCreateSession, getVisitorType, getOrCreateVisitorId } from './sessionTracking';

// Collapse a session's original attribution into the single `originalSource`
// string /api/analytics stores at row[2] — mirrors the buildSource logic in the
// track-* endpoints (utm source[/medium[/campaign]] else original referrer).
function originalSourceFrom(session) {
  if (session && session.originalUtmSource) {
    let s = session.originalUtmSource;
    if (session.originalUtmMedium) s += `/${session.originalUtmMedium}`;
    if (session.originalUtmCampaign) s += `/${session.originalUtmCampaign}`;
    return s;
  }
  if (session && session.originalReferrer) return session.originalReferrer;
  return typeof document !== 'undefined' ? (document.referrer || 'direct') : 'direct';
}

// Fire an analytics event with full session/visitor context.
//   eventType — required event name
//   filename  — image/product identifier (nullable)
//   category  — category or surface slug (nullable)
//   extra     — optional fields to add/override on the payload (e.g. { email })
export function trackEvent(eventType, filename = null, category = null, extra = {}) {
  if (typeof window === 'undefined') return;
  try {
    // getOrCreateSession is idempotent — guarantees a session id even if the
    // event fires before the page-view tracker has run.
    const session = getOrCreateSession();
    const payload = {
      eventType,
      filename,
      category,
      originalSource: originalSourceFrom(session),
      sessionId: session?.id || null,
      visitorId: getOrCreateVisitorId(),
      pageViewsInSession: session?.pageViews || 0,
      downloadsInSession: session?.downloads || 0,
      visitorType: getVisitorType(),
      landingPage: session?.landingPage || null,
      ...extra,
    };
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // analytics must never break the UI
  }
}
