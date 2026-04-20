import Stripe from 'stripe';
import AWS from 'aws-sdk';
import { getProduct } from '../../lib/products';

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

    // Confirm this session authorises the requested product
    if (session.metadata?.product_id !== productId) {
      return res.status(403).json({ error: 'Product not included in this purchase' });
    }

    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: 'streambackdrops-premium',
      Key: product.r2File,
      Expires: 3600,
      ResponseContentDisposition: `attachment; filename="${product.r2File}"`,
    });

    return res.redirect(signedUrl);

  } catch (error) {
    console.error('HD S3 download error:', error);
    return res.status(500).json({ error: 'Download failed' });
  }
}
