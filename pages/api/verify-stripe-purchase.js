import Stripe from 'stripe';
import { getProduct } from '../../lib/products';
import { reassembleProductIds } from '../../lib/checkoutProducts';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ verified: false, error: 'Payment not completed' });
    }

    // Bundles spread their ids over product_ids, product_ids_2, …; singles may
    // set only product_id. reassembleProductIds handles both.
    const ids = reassembleProductIds(session.metadata);

    if (ids.length === 0) {
      return res.status(400).json({ verified: false, error: 'No product IDs in session metadata' });
    }

    const products = ids.map(id => getProduct(id)).filter(Boolean);

    if (products.length === 0) {
      return res.status(400).json({ verified: false, error: 'Unrecognised product(s)' });
    }

    return res.status(200).json({
      verified: true,
      product_ids: ids,
      products,
      // Backwards compat for single-item consumers
      product_id: ids[0],
      product: products[0],
      // For GA4 purchase event: amount_total is in the smallest currency unit
      // (cents for USD). Send these to the client so it can populate the
      // gtag('event', 'purchase', { value, currency }) ecommerce hit.
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    console.error('Stripe verification failed:', error);
    return res.status(500).json({ verified: false, error: error.message });
  }
}
