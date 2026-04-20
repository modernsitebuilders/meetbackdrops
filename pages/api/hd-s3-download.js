import Stripe from 'stripe';
import AWS from 'aws-sdk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id, imageId } = req.query;

  if (!session_id || !imageId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // 🔐 Verify purchase with Stripe (MUST happen before any session usage)
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // 🧪 Debug log (SAFE - after session exists)
    console.log("STRIPE SESSION FOUND:", {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
    });

    if (session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Payment not verified' });
    }

    // 🧠 Unified metadata format (multi-image safe)
    const allowedImages = JSON.parse(session.metadata?.product_ids || '[]');

    // 🔒 Validate purchase entitlement
    if (!allowedImages.includes(imageId)) {
      return res.status(403).json({
        error: 'Image not included in this purchase',
      });
    }

    // ☁️ Generate signed S3 URL (1 hour expiry)
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: 'streambackdrops-premium',
      Key: `${imageId}.png`,
      Expires: 3600,
      ResponseContentDisposition: `attachment; filename="${imageId}.png"`,
    });

    return res.redirect(signedUrl);

  } catch (error) {
    console.error('HD S3 download error:', error);

    return res.status(500).json({
      error: 'Download failed',
    });
  }
}