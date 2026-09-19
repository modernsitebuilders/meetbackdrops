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
