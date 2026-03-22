import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const m = session.metadata;
      const selected_images = m.selected_images
        || [m.selected_images_1, m.selected_images_2].filter(Boolean).join(',');
      return res.status(200).json({ verified: true, selected_images });
    }

    return res.status(400).json({ verified: false, error: 'Payment not completed' });

  } catch (error) {
    console.error('Stripe verification failed:', error);
    return res.status(500).json({ verified: false, error: 'Verification failed' });
  }
}