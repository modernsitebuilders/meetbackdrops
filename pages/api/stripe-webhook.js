import Stripe from 'stripe';

const isTest = process.env.STRIPE_MODE === 'test';

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

  // Subscription checkouts are acknowledged here; lifecycle handling lives elsewhere.
  if (metadata.product_type === 'subscription') {
    console.log('[stripe-webhook] Subscription checkout acknowledged:', {
      session_id: session.id,
      customer: session.customer,
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

  // product_ids is a comma-joined string set by create-checkout.js
  const productIds = metadata.product_ids
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (productIds.length === 0) {
    console.error('[stripe-webhook] Empty product_ids after parse:', metadata.product_ids);
    return res.status(400).json({ error: 'Invalid product_ids format' });
  }

  console.log('[stripe-webhook] HD image purchase verified:', {
    session_id: session.id,
    product_ids: productIds,
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