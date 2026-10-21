import crypto from 'crypto';
import Stripe from 'stripe';
import AWS from 'aws-sdk';
import sharp from 'sharp';
import { getLogoBase, isLogoReady, LOGO_PRICE_CENTS, OUTPUT_WIDTH, OUTPUT_HEIGHT } from '../../lib/logoBackground';
import { attributionMetadata } from '../../lib/checkoutAttribution';

// "Add your logo" checkout. The editor sends only the logo/text layer (cropped
// to its bounding box) plus where it sits in the 1920×1080 frame. We store it
// privately under logo-orders/ in the premium bucket and render the final
// composite in /api/logo-download once Stripe marks the session paid.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const BUCKET = 'streambackdrops-premium';
const MAX_OVERLAY_BYTES = 3 * 1024 * 1024;

export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, overlay, left, top, settings, analytics } = req.body || {};
  if (!slug || !isLogoReady(slug)) {
    return res.status(400).json({ error: 'This background is not available for logos.' });
  }

  const match = typeof overlay === 'string' && overlay.match(/^data:image\/png;base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: 'Missing logo layer.' });
  }
  const overlayBuf = Buffer.from(match[1], 'base64');
  if (overlayBuf.length > MAX_OVERLAY_BYTES) {
    return res.status(413).json({ error: 'Logo layer is too large. Try a smaller logo file.' });
  }

  // The layer must be a real PNG that fits inside the frame at (left, top).
  let meta;
  try {
    meta = await sharp(overlayBuf).metadata();
  } catch {
    return res.status(400).json({ error: 'Logo layer is not a valid image.' });
  }
  const x = Number.parseInt(left, 10);
  const y = Number.parseInt(top, 10);
  if (meta.format !== 'png' || !(x >= 0) || !(y >= 0)
      || x + meta.width > OUTPUT_WIDTH || y + meta.height > OUTPUT_HEIGHT) {
    return res.status(400).json({ error: 'Logo layer does not fit the frame.' });
  }

  const orderId = crypto.randomUUID();
  try {
    await s3.putObject({
      Bucket: BUCKET, Key: `logo-orders/${orderId}/overlay.png`, Body: overlayBuf, ContentType: 'image/png',
    }).promise();
    await s3.putObject({
      Bucket: BUCKET,
      Key: `logo-orders/${orderId}/order.json`,
      Body: JSON.stringify({ slug, base: getLogoBase(slug), left: x, top: y, settings: settings || {}, createdAt: new Date().toISOString() }),
      ContentType: 'application/json',
    }).promise();
  } catch (err) {
    console.error('[create-logo-checkout] S3 upload failed:', err.message);
    return res.status(500).json({ error: 'Could not save your design. Please try again.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: LOGO_PRICE_CENTS,
          product_data: {
            name: 'Your logo on a MeetBackdrops background',
            description: '1920×1080 PNG for Zoom, Teams and Google Meet, without the preview watermark.',
          },
        },
      }],
      payment_intent_data: { statement_descriptor_suffix: 'MEETBACKDROPS' },
      success_url: `${req.headers.origin}/logo-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/add-logo/${slug}`,
      metadata: {
        site: 'streambackdrops',
        product_type: 'logo_background',
        order_id: orderId,
        image_slug: slug,
        ...attributionMetadata(analytics),
      },
    });
    if (!session?.url) {
      return res.status(500).json({ error: 'Stripe session missing URL' });
    }
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[create-logo-checkout] Stripe error:', err.message);
    return res.status(500).json({ error: 'Checkout failed. Please try again.' });
  }
}
