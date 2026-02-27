import Stripe from 'stripe';
import { Redis } from '@upstash/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ valid: false, error: 'Missing token' });
  }

  try {
    // Look up token in Redis
    const tokenData = await redis.get(`sub_token:${token}`);
    if (!tokenData) {
      return res.status(200).json({ valid: false, error: 'Token not found or expired' });
    }

    const { customerId, email } = tokenData;

    // Check subscription status (cached 1 hour)
    let statusData = await redis.get(`sub_status:${customerId}`);

    if (!statusData) {
      // Not cached — fetch live from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      const activeSub = subscriptions.data[0];
      if (!activeSub) {
        return res.status(200).json({ valid: false, error: 'No active subscription' });
      }

      statusData = {
        active: true,
        periodStart: activeSub.current_period_start,
      };

      // Cache for 1 hour
      await redis.set(`sub_status:${customerId}`, statusData, { ex: 3600 });
    }

    if (!statusData.active) {
      return res.status(200).json({ valid: false, error: 'Subscription inactive' });
    }

    // Get download count for this billing period
    const downloadKey = `sub_downloads:${customerId}:${statusData.periodStart}`;
    const downloadData = await redis.get(downloadKey);
    const downloadsThisMonth = downloadData?.count || 0;
    const remaining = Math.max(0, 10 - downloadsThisMonth);

    return res.status(200).json({
      valid: true,
      email,
      downloadsThisMonth,
      remaining,
      periodStart: statusData.periodStart,
    });

  } catch (error) {
    console.error('Verify subscription error:', error);
    return res.status(500).json({ valid: false, error: 'Verification failed' });
  }
}
