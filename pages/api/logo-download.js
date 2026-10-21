import Stripe from 'stripe';
import AWS from 'aws-sdk';
import sharp from 'sharp';
import { OUTPUT_WIDTH, OUTPUT_HEIGHT } from '../../lib/logoBackground';

// Renders a paid "Add your logo" order: base background (the HD master when
// one exists, else the free PNG) resized to 1920×1080, with the buyer's logo
// layer composited where they placed it. Only runs for a paid Stripe session.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const BUCKET = 'streambackdrops-premium';

async function loadBase(base) {
  if (base.hdKey) {
    try {
      const obj = await s3.getObject({ Bucket: BUCKET, Key: base.hdKey }).promise();
      return obj.Body;
    } catch (err) {
      console.error('[logo-download] HD master missing, using free PNG:', base.hdKey, err.message);
    }
  }
  const r = await fetch(`https://assets.streambackdrops.com/${base.png}`);
  if (!r.ok) throw new Error(`base image ${base.png} returned ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const m = session.metadata || {};
    if (session.payment_status !== 'paid' || m.product_type !== 'logo_background' || !m.order_id) {
      return res.status(403).json({ error: 'Payment not verified' });
    }

    // Render once, keep the result next to the order, and hand out a signed
    // link: a 1920×1080 PNG is ~5 MB, over Vercel's 4.5 MB response limit, so
    // it can't be streamed back from the function.
    const prefix = `logo-orders/${m.order_id}`;
    const finalKey = `${prefix}/final.png`;
    const exists = await s3.headObject({ Bucket: BUCKET, Key: finalKey }).promise().then(() => true, () => false);
    if (!exists) {
      const [orderObj, overlayObj] = await Promise.all([
        s3.getObject({ Bucket: BUCKET, Key: `${prefix}/order.json` }).promise(),
        s3.getObject({ Bucket: BUCKET, Key: `${prefix}/overlay.png` }).promise(),
      ]);
      const order = JSON.parse(orderObj.Body.toString('utf8'));
      // The base paths were frozen into the order at checkout, so a paid order
      // still renders if the image is later taken off the logo list.
      const png = await sharp(await loadBase(order.base))
        .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, { fit: 'cover' })
        .composite([{ input: overlayObj.Body, left: order.left, top: order.top }])
        .png()
        .toBuffer();
      await s3.putObject({ Bucket: BUCKET, Key: finalKey, Body: png, ContentType: 'image/png' }).promise();
    }

    const url = s3.getSignedUrl('getObject', {
      Bucket: BUCKET,
      Key: finalKey,
      Expires: 3600,
      ResponseContentDisposition: `attachment; filename="MeetBackdrops-${m.image_slug || 'logo'}-logo.png"`,
    });
    return res.redirect(url);
  } catch (err) {
    console.error('[logo-download] failed:', err.message);
    return res.status(500).json({ error: 'Could not prepare your file. Please try again or contact info@meetbackdrops.com.' });
  }
}
