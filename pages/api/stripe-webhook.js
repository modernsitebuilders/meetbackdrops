import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import { insertAnalyticsEventSafe } from '../../lib/neonEvents.mjs';
import { sendStudioAlert, formatMoney } from '../../lib/studioAlert';

const isTest = process.env.STRIPE_MODE === 'test';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Record a completed sale as a revenue analytics event (`hd_purchase`,
// `hd_subscription` or `license_purchase` — REVENUE_EVENTS in
// lib/analyticsNormalize.js) — the same 15-column row shape pages/api/analytics.js
// writes — straight from the webhook.
//
// WHY here and not on the success pages: a client-side write fires only if the
// buyer returns to the success page AND their browser lets the /api/analytics
// beacon through. Ad/privacy blockers (which block paths named "analytics") and
// closed tabs silently drop it, so real, paid sales went unrecorded (e.g. the
// 2026-08-11 HD sale). Stripe retries this webhook until it gets a 200,
// server-side, so it's the reliable, ad-blocker-proof record. The success pages
// now send only the GA4 purchase event, so nothing is counted twice.
//
// Dedup: the row timestamp is derived from the Stripe session's `created` time (not
// wall-clock now), so a webhook redelivery produces a byte-identical row → identical
// row_hash → ON CONFLICT (row_hash) DO NOTHING no-ops it. The buyer's attribution
// rides in on session.metadata (a_sid/a_vid/a_src/..., lib/checkoutAttribution.js).
async function recordRevenueEvent(session, eventType, filename, category) {
  try {
    const m = session?.metadata || {};
    // ET wall-clock string matching the format pages/api/analytics.js writes, built
    // from the Stripe session creation instant so it's stable across redeliveries.
    const created = session?.created ? new Date(session.created * 1000) : new Date();
    const et = (opts) => created.toLocaleString('en-US', { timeZone: 'America/New_York', ...opts });
    const row = [
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
      created.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
      created.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      'stripe-webhook',
      'stripe-webhook',
    ];
    // Queue for the Sheet (system of record) + live-mirror to Neon, exactly like
    // pages/api/analytics.js. Both dedup on the shared cell-hash, so the
    // sheet→Neon reconciliation won't double-insert.
    await redis.rpush('analytics:queue', JSON.stringify(row));
    await insertAnalyticsEventSafe(row);
  } catch (e) {
    // Never let analytics recording break the 200 we owe Stripe.
    console.error(`[stripe-webhook] ${eventType} recording failed:`, e?.message);
  }
}

// Email the studio about the sale. Stripe redelivers webhooks (retries, manual
// resends), so claim the session id in Redis first — one sale, one email. If Redis
// is unreachable we send anyway: a duplicate alert beats a missed sale.
async function alertSale(session, { product, detail }) {
  try {
    let claimed = true;
    try {
      claimed = (await redis.set(`sale_alerted:${session.id}`, '1', { nx: true, ex: 60 * 60 * 24 * 30 })) === 'OK';
    } catch { /* Redis down — fall through and send */ }
    if (!claimed) return;

    const m = session?.metadata || {};
    const cd = session?.customer_details || {};
    const amount = formatMoney(session?.amount_total, session?.currency || 'usd');
    await sendStudioAlert({
      subject: `💰 New sale: ${product} — ${amount}${isTest ? ' [TEST MODE]' : ''}`,
      eyebrow: `MeetBackdrops · New sale${isTest ? ' · TEST MODE' : ''}`,
      heading: `${product} — ${amount}`,
      rows: [
        ['Customer', cd.name],
        ['Email', cd.email],
        ...detail,
        ['Came from', m.a_src],
        ['Landing page', m.a_land],
        ['Stripe session', session.id],
      ],
      replyTo: cd.email || undefined,
      footer: 'Reply to this email to reach the customer directly.',
    });
  } catch (e) {
    console.error('[stripe-webhook] sale alert failed:', e?.message);
  }
}

const stripe = new Stripe(
  isTest
    ? process.env.STRIPE_SECRET_KEY_TEST
    : process.env.STRIPE_SECRET_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

// Reassemble the full product-id list from the numbered metadata keys written
// by create-checkout.js (product_ids, product_ids_2, product_ids_3, …). The
// chunks are contiguous, so stop at the first missing key.
function reassembleProductIds(metadata) {
  const parts = [];
  for (let i = 1; ; i++) {
    const key = i === 1 ? 'product_ids' : `product_ids_${i}`;
    const value = metadata[key];
    if (value == null) break;
    parts.push(value);
  }
  return parts
    .join(',')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event;

  try {
    const rawBody = await getRawBody(req);

    // 🧠 SAFE MODE SWITCH (TEST vs LIVE) — must match the Stripe key mode above.
    const webhookSecret = isTest
      ? process.env.STRIPE_WEBHOOK_SECRET_TEST
      : process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        '[stripe-webhook] Missing webhook secret env var for mode:',
        isTest ? 'test' : 'live'
      );
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret
    );

  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err.message);
    return res.status(400).json({
      error: `Webhook signature invalid: ${err.message}`,
    });
  }

  // Only handle successful checkout sessions
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, ignored: true });
  }

  const session = event.data.object;
  const metadata = session?.metadata;

  // 🛡️ Cross-site safety gate: ignore events from other sites on the shared Stripe account.
  // Every MeetBackdrops checkout sets metadata.site = 'streambackdrops'.
  if (!metadata || metadata.site !== 'streambackdrops') {
    console.log('[stripe-webhook] Ignored — not a MeetBackdrops event.', {
      session_id: session.id,
      site: metadata?.site ?? '(missing)',
    });
    return res.status(200).json({ received: true, ignored: true });
  }

  // HD subscription ($9/mo): record + alert. Access itself is granted by
  // /api/subscription-activate when the buyer lands on /subscription-success.
  if (metadata.product_type === 'subscription') {
    const email = session?.customer_details?.email || '';
    await recordRevenueEvent(session, 'hd_subscription', email, 'subscription');
    await alertSale(session, {
      product: 'HD Subscription',
      detail: [['Plan', '10 HD downloads / month']],
    });
    return res.status(200).json({ received: true });
  }

  // Commercial licenses ($49 single image / $299 library): record + alert. The
  // certificate + HD file are served by /license-success via /api/verify-license.
  if (metadata.product_type === 'extended_license' || metadata.product_type === 'commercial_library') {
    const isLibrary = metadata.product_type === 'commercial_library';
    const licensee = (session?.custom_fields || []).find((f) => f.key === 'licensee')?.text?.value;
    await recordRevenueEvent(session, 'license_purchase', metadata.product_id || metadata.license_type || metadata.product_type, 'license');
    await alertSale(session, {
      product: isLibrary ? 'Commercial Library License' : 'Extended License',
      detail: [
        ['Licensee', licensee],
        ...(isLibrary ? [] : [['Image', metadata.product_id]]),
      ],
    });
    return res.status(200).json({ received: true });
  }

  // HD image purchase path
  if (metadata.product_type !== 'hd_image' || !metadata.product_ids) {
    console.log('[stripe-webhook] Ignored — unknown product_type for MeetBackdrops.', {
      session_id: session.id,
      product_type: metadata.product_type ?? '(missing)',
      product_ids: metadata.product_ids ?? '(missing)',
    });
    return res.status(200).json({ received: true, ignored: true });
  }

  // product_ids is a comma-joined string set by create-checkout.js. Large
  // bundles (10-/20-packs) exceed Stripe's 500-char metadata-value cap, so the
  // list is split across contiguous numbered keys: product_ids, product_ids_2,
  // product_ids_3, … Reassemble them in order before parsing (must stay in sync
  // with productIdMetadata() in create-checkout.js).
  const productIds = reassembleProductIds(metadata);

  if (productIds.length === 0) {
    console.error('[stripe-webhook] Empty product_ids after parse:', metadata.product_ids);
    return res.status(400).json({ error: 'Invalid product_ids format' });
  }

  console.log('[stripe-webhook] HD image purchase verified:', {
    session_id: session.id,
    product_ids: productIds,
  });

  // 📊 Record the sale server-side (reliable; not dependent on the buyer returning
  // to /hd-download or their browser allowing the analytics beacon through).
  await recordRevenueEvent(session, 'hd_purchase', productIds.join(','), 'hd');
  await alertSale(session, {
    product: productIds.length === 1 ? 'HD Edition' : `HD Editions (${productIds.length}-pack)`,
    detail: [['Images', productIds.join(', ')]],
  });

  // 🔓 Unlock each purchased HD image
  for (const id of productIds) {
    console.log('Unlock HD:', id);

    // TODO: persist entitlement
    // Example:
    // await db.purchases.create({
    //   session_id: session.id,
    //   product_id: id,
    //   paid_at: new Date(),
    // });
  }

  return res.status(200).json({ received: true });
}
