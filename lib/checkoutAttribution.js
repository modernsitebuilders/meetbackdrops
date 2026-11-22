// lib/checkoutAttribution.js
//
// Server-only. Turns the buyer's first-party analytics attribution (from
// getAttribution() in lib/trackEvent.js, posted by the client as `analytics`)
// into Stripe session metadata, so pages/api/stripe-webhook.js — the reliable,
// server-side, ad-blocker-proof record of every sale — can emit a
// fully-attributed revenue event. Without it the webhook still records the sale,
// just as source 'direct'/unknown.
//
// Stripe metadata values are strings ≤500 chars; truncate defensively and drop
// empties. Shared by every checkout endpoint (HD, subscription, license).

export function attributionMetadata(analytics) {
  const a = analytics && typeof analytics === 'object' ? analytics : {};
  const metaStr = (v) => (v == null ? '' : String(v).slice(0, 480));
  const meta = {};
  if (metaStr(a.sessionId))      meta.a_sid   = metaStr(a.sessionId);
  if (metaStr(a.visitorId))      meta.a_vid   = metaStr(a.visitorId);
  if (metaStr(a.originalSource)) meta.a_src   = metaStr(a.originalSource);
  if (metaStr(a.landingPage))    meta.a_land  = metaStr(a.landingPage);
  if (metaStr(a.visitorType))    meta.a_vtype = metaStr(a.visitorType);
  if (a.pageViews != null)       meta.a_pv    = metaStr(a.pageViews);
  return meta;
}

// Build a server-side analytics row in the same 15-column shape
// pages/api/analytics.js writes, attributed from the a_* keys above. Used by the
// Stripe webhook (revenue events) and /api/hd-s3-download (hd_file_download), so
// server-recorded events join the buyer's browsing session by a_sid / a_vid.
// `source` fills the user_agent + referer columns, marking where the row came from.
export function attributedEventRow(metadata, when, eventType, filename, category, source) {
  const m = metadata || {};
  const et = (opts) => when.toLocaleString('en-US', { timeZone: 'America/New_York', ...opts });
  return [
    et({ year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    eventType,
    m.a_src || 'direct',
    filename,
    category,
    m.a_pv != null ? parseInt(m.a_pv, 10) || 0 : 0,
    0,
    m.a_vtype || 'new',
    m.a_land || '',
    m.a_sid || '',
    m.a_vid || 'unknown',
    when.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
    when.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    source,
    source,
  ];
}
