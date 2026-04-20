import Stripe from 'stripe';
import { getProduct } from '../../lib/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);

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

    const productId = session.metadata?.product_id;
    if (!productId) {
      return res.status(400).json({ verified: false, error: 'No product_id in session metadata' });
    }

    const product = getProduct(productId);
    if (!product) {
      console.error('verify-stripe-purchase: unknown product_id in metadata:', productId);
      return res.status(400).json({ verified: false, error: 'Unrecognised product' });
    }

    return res.status(200).json({ verified: true, product_id: productId, product });

  } catch (error) {
    console.error('Stripe verification failed:', error);
    return res.status(500).json({ verified: false, error: 'Verification failed' });
  }
}
