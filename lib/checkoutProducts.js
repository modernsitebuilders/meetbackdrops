// lib/checkoutProducts.js
//
// Server-only. Reads the purchased HD product ids back out of a Stripe checkout
// session's metadata.
//
// create-checkout.js splits the id list across numbered keys — product_ids,
// product_ids_2, product_ids_3, … — because a 10-/20-pack overflows Stripe's
// 500-char metadata-value cap. EVERY reader must reassemble all chunks: reading
// only `product_ids` silently dropped the last 3 images of a 10-pack from the
// download page (first real 10-pack, 2026-11-21). The chunks are contiguous, so
// stop at the first missing key. Single-item / license sessions that set only
// `product_id` (or the legacy `productId`) fall back to that.

export function reassembleProductIds(metadata) {
  const m = metadata || {};
  const parts = [];
  for (let i = 1; ; i++) {
    const key = i === 1 ? 'product_ids' : `product_ids_${i}`;
    const value = m[key];
    if (value == null) break;
    parts.push(value);
  }
  if (parts.length === 0) {
    const single = m.product_id || m.productId;
    if (single) parts.push(single);
  }
  return parts
    .join(',')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
