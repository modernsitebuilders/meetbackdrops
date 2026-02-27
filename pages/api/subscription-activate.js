import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.body;
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const customer = session.customer;
    const customerId = typeof customer === 'string' ? customer : customer.id;
    const email = typeof customer === 'string' ? session.customer_details?.email : customer.email;

    const subscription = session.subscription;
    const periodStart = typeof subscription === 'string'
      ? (await stripe.subscriptions.retrieve(subscription)).current_period_start
      : subscription.current_period_start;

    // Generate token (30-day TTL)
    const token = crypto.randomUUID();
    await redis.set(
      `sub_token:${token}`,
      { customerId, email },
      { ex: 30 * 24 * 60 * 60 }
    );

    // Cache subscription status
    await redis.set(
      `sub_status:${customerId}`,
      { active: true, periodStart },
      { ex: 3600 }
    );

    return res.status(200).json({ token, email });

  } catch (error) {
    console.error('Subscription activate error:', error);
    return res.status(500).json({ error: 'Activation failed' });
  }
}
