import Stripe from 'stripe';
import { getProduct } from '../../lib/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Verifies a commercial/extended license purchase and returns the details the
// success page and the printable certificate need. Handles both license types:
//   - extended_license  → tied to one HD image (product_ids in metadata)
//   - commercial_library → whole-catalog, 12-month term (no product)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.body || {};
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer_details'],
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ verified: false, error: 'Payment not completed' });
    }

    const licenseType = session.metadata?.license_type || null;
    const productType = session.metadata?.product_type || null;

    if (productType !== 'extended_license' && productType !== 'commercial_library') {
      return res.status(400).json({ verified: false, error: 'Not a license purchase' });
    }

    // Licensee name from the Stripe custom field, falling back to the billing name.
    const licenseeField = (session.custom_fields || []).find(f => f.key === 'licensee');
    const licensee =
      licenseeField?.text?.value ||
      session.customer_details?.name ||
      'Licensee';
    const email = session.customer_details?.email || '';

    let productId = null;
    let productTitle = null;
    if (licenseType === 'image') {
      productId =
        session.metadata?.product_ids ||
        session.metadata?.product_id ||
        null;
      const product = productId ? getProduct(productId) : null;
      productTitle = product?.title || productId;
    }

    // License term: 12 months from purchase for the library license; perpetual
    // for the per-image extended license (one-time grant for that asset).
    const purchasedAt = session.created ? session.created * 1000 : Date.now();
    const expiresAt =
      licenseType === 'library'
        ? new Date(purchasedAt + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    return res.status(200).json({
      verified: true,
      licenseType,
      productType,
      productId,
      productTitle,
      licensee,
      email,
      orderId: session.id,
      purchasedAt: new Date(purchasedAt).toISOString(),
      expiresAt,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    console.error('License verification failed:', error);
    return res.status(500).json({ verified: false, error: error.message });
  }
}
