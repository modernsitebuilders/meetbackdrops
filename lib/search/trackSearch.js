// lib/search/trackSearch.js
//
// Lightweight search measurement. Closes the loop:
//   search demand → missing content → new assets → stronger discovery graph.
//
// Deliberately NOT a new analytics system: it reuses the existing
// /api/analytics endpoint (bot-filtered → Upstash Redis queue → Google Sheets)
// and the existing anonymous session identity (lib/sessionTracking). No new
// endpoint, no new store, no new identifier.
//
// The existing analytics row has two free payload slots (filename, category);
// each search event packs its data into those so no schema change is needed.
// Analysts filter the sheet by eventType:
//   search_query         filename=query      category=n=<resultCount>
//   search_zero_result   filename=query      category=n=0
//   search_result_click  filename=slug       category=q=<query>|p=<position>
//   search_filter        filename=group=val  category=search
//
// Privacy: anonymous visitorId only; queries trimmed + length-capped; nothing
// is sent for queries shorter than 2 chars.

import { getSessionData, getOrCreateVisitorId, isReturningVisitor } from '../sessionTracking';

const cap = (s, n = 80) => String(s == null ? '' : s).trim().slice(0, n);

function send(eventType, filename, category) {
  if (typeof window === 'undefined') return;
  try {
    const session = getSessionData();
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        filename,
        category,
        sessionId: session?.id,
        visitorId: getOrCreateVisitorId(),
        visitorType: isReturningVisitor() ? 'returning' : 'new',
        pageViewsInSession: session?.pageViews || 0,
        downloadsInSession: session?.downloads || 0,
        landingPage: session?.landingPage || '',
        originalSource: session?.originalReferrer || 'direct',
      }),
    }).catch(() => {});
  } catch (e) {
    // Measurement must never break search.
  }
}

// A settled query + its result count. Zero-result queries are the highest-signal
// input for the content pipeline, so they get their own eventType.
export function trackSearchQuery(query, resultCount) {
  const q = cap(query);
  if (q.length < 2) return;
  if (resultCount === 0) send('search_zero_result', q, 'n=0');
  else send('search_query', q, `n=${resultCount}`);
}

// A result card engaged (preview opened). Captures which query produced it and
// where it ranked — signal for ranking quality.
export function trackSearchClick(query, slug, position) {
  const s = cap(slug, 120);
  if (!s) return;
  send('search_result_click', s, `q=${cap(query, 60)}|p=${position}`);
}

// A facet applied (fired on ADD only, to keep volume low).
export function trackSearchFilter(group, value) {
  send('search_filter', `${group}=${cap(value, 60)}`, 'search');
}
