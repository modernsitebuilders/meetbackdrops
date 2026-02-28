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

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: email.toLowerCase().trim(), limit: 5 });

    if (!customers.data.length) {
      return res.status(404).json({ error: 'No subscription found for this email address.' });
    }

    // Find one with an active subscription
    let activeCustomer = null;
    let activeSub = null;

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      });
      if (subscriptions.data.length) {
        activeCustomer = customer;
        activeSub = subscriptions.data[0];
        break;
      }
    }

    if (!activeCustomer || !activeSub) {
      return res.status(404).json({ error: 'No active subscription found for this email address.' });
    }

    // Generate new token (30-day TTL)
    const token = crypto.randomUUID();
    await redis.set(
      `sub_token:${token}`,
      { customerId: activeCustomer.id, email: activeCustomer.email },
      { ex: 30 * 24 * 60 * 60 }
    );

    // Cache subscription status
    await redis.set(
      `sub_status:${activeCustomer.id}`,
      { active: true, periodStart: activeSub.current_period_start },
      { ex: 3600 }
    );

    // Track token refresh (new device / session restore)
    const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
    fetch(`${baseUrl}/api/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'user-agent': 'subscriber' },
      body: JSON.stringify({
        eventType: 'sub_token_refresh',
        filename: activeCustomer.email,
        category: 'subscription',
        originalSource: req.headers['referer'] || 'direct',
      }),
    }).catch(() => {});

    return res.status(200).json({ token });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
