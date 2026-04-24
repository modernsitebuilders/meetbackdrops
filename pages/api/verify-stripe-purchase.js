import Stripe from 'stripe';
import { getProduct } from '../../lib/products';

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

    // Support both bundle (product_ids) and single (product_id) metadata
    const rawIds =
      session.metadata?.product_ids ||
      session.metadata?.productId ||
      session.metadata?.product_id;

    if (!rawIds) {
      return res.status(400).json({ verified: false, error: 'No product IDs in session metadata' });
    }

    const ids = rawIds.split(',').map(s => s.trim()).filter(Boolean);
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
    });
  } catch (error) {
    console.error('Stripe verification failed:', error);
    return res.status(500).json({ verified: false, error: error.message });
  }
}
