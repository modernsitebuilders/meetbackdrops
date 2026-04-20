import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    // 🧠 SAFE MODE SWITCH (TEST vs LIVE)
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET_TEST ||
      process.env.STRIPE_WEBHOOK_SECRET;

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

  // 🛡️ Safety gate: only StreamBackdrops HD image purchases
  if (
    !metadata ||
    metadata.product_type !== 'hd_image' ||
    !metadata.product_ids
  ) {
    console.log('[stripe-webhook] Ignored — not an HD image purchase.', {
      session_id: session.id,
      product_type: metadata?.product_type ?? '(missing)',
      product_ids: metadata?.product_ids ?? '(missing)',
    });

    return res.status(200).json({ received: true, ignored: true });
  }

  // 🔓 Parse multi-image purchase payload
  let productIds = [];

  try {
    productIds = JSON.parse(metadata.product_ids || '[]');
  } catch (err) {
    console.error('[stripe-webhook] Failed to parse product_ids:', err.message);

    return res.status(400).json({
      error: 'Invalid product_ids format',
    });
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