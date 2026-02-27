import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import { v2 as cloudinary } from 'cloudinary';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnhju6mhg',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONTHLY_LIMIT = 10;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, imageId, category } = req.body;

  if (!token || !imageId || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Validate token
    const tokenData = await redis.get(`sub_token:${token}`);
    if (!tokenData) {
      return res.status(401).json({ error: 'Invalid or expired subscription token' });
    }

    const { customerId } = tokenData;

    // 2. Verify subscription is still active (1hr cache)
    let statusData = await redis.get(`sub_status:${customerId}`);
    if (!statusData) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      const activeSub = subscriptions.data[0];
      if (!activeSub) {
        return res.status(403).json({ error: 'No active subscription' });
      }

      statusData = {
        active: true,
        periodStart: activeSub.current_period_start,
      };
      await redis.set(`sub_status:${customerId}`, statusData, { ex: 3600 });
    }

    if (!statusData.active) {
      return res.status(403).json({ error: 'Subscription inactive' });
    }

    // 3. Check monthly download limit
    const downloadKey = `sub_downloads:${customerId}:${statusData.periodStart}`;
    const downloadData = await redis.get(downloadKey) || { count: 0, images: [] };

    if (downloadData.count >= MONTHLY_LIMIT) {
      return res.status(429).json({
        error: `Monthly download limit reached (${MONTHLY_LIMIT}/month). Your limit resets on your next billing date.`,
      });
    }

    // 4. Generate signed Cloudinary URL expiring in 1 hour
    const publicId = `streambackdrops/${category}/${imageId}`;
    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    const signedUrl = cloudinary.url(publicId, {
      resource_type: 'image',
      type: 'upload',
      sign_url: true,
      expires_at: expiresAt,
      format: 'png',
    });

    // 5. Increment download count (45-day TTL so it auto-expires after billing period)
    const newDownloadData = {
      count: downloadData.count + 1,
      images: [...(downloadData.images || []), imageId],
    };
    await redis.set(downloadKey, newDownloadData, { ex: 45 * 24 * 60 * 60 });

    return res.status(200).json({
      url: signedUrl,
      downloadsThisMonth: newDownloadData.count,
      remaining: Math.max(0, MONTHLY_LIMIT - newDownloadData.count),
    });

  } catch (error) {
    console.error('Subscription download error:', error);
    return res.status(500).json({ error: 'Download failed' });
  }
}
