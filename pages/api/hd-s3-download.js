import Stripe from 'stripe';
import AWS from 'aws-sdk';
import { Redis } from '@upstash/redis';
import { getProduct } from '../../lib/products';
import { reassembleProductIds } from '../../lib/checkoutProducts';
import { attributedEventRow } from '../../lib/checkoutAttribution';
import { insertAnalyticsEventSafe } from '../../lib/neonEvents.mjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  // The buyer is waiting on this redirect: if Redis is down, give up fast rather
  // than sit through the client's default ~4s of retry backoff.
  retry: { retries: 1, backoff: () => 100 },
});

// Record each HD file fetch server-side (the click is a plain <a download>, so
// there's no client event, and blockers would drop one anyway). Attributed from
// the Stripe session's a_* metadata, so it joins the buyer's browsing session.
// `hd_file_download` = signed URL issued; `hd_file_download_denied` = a paid
// session asked for a file it doesn't cover (how the 2026-11-21 10-pack bug,
// where 3 of 10 files were missing, would have shown up). Neither is in
// DOWNLOAD_EVENTS: they're post-purchase fulfilment, not free-image usage.
async function recordFileEvent(session, eventType, productId) {
  try {
    const row = attributedEventRow(session?.metadata, new Date(), eventType, productId, 'hd', 'hd-s3-download');
    await redis.rpush('analytics:queue', JSON.stringify(row));
    await insertAnalyticsEventSafe(row);
  } catch (e) {
    // Never let analytics block the buyer's download.
    console.error(`[hd-s3-download] ${eventType} recording failed:`, e?.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id, productId } = req.query;

  if (!session_id || !productId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const product = getProduct(productId);
  if (!product) {
    return res.status(400).json({ error: `Unknown product: ${productId}` });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log("STRIPE SESSION FOUND:", {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
    });

    if (session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Payment not verified' });
    }

    // Confirm this session authorises the requested product. Bundles spread
    // their ids over product_ids, product_ids_2, … — read every chunk.
    const authorized = new Set(reassembleProductIds(session.metadata));
    if (!authorized.has(productId)) {
      await recordFileEvent(session, 'hd_file_download_denied', productId);
      return res.status(403).json({ error: 'Product not included in this purchase' });
    }

    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: 'streambackdrops-premium',
      Key: product.r2File,
      Expires: 3600,
      ResponseContentDisposition: `attachment; filename="${product.r2File}"`,
    });

    await recordFileEvent(session, 'hd_file_download', productId);
    return res.redirect(signedUrl);

  } catch (error) {
    console.error('HD S3 download error:', error);
    return res.status(500).json({ error: 'Download failed' });
  }
}
