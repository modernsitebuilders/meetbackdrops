import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      // No payment_method_types: Stripe Checkout shows the Dashboard-enabled methods
      // that support recurring billing (cards, Link, ACH, SEPA, etc.), optimized per
      // customer. Methods that can't do subscriptions are filtered out automatically.
      line_items: [
        {
          price: process.env.STRIPE_SUB_PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        description: '10 HD background downloads per month. Downloads reset each billing cycle.',
        metadata: {
          site: 'streambackdrops',
          product_type: 'subscription',
        },
      },
      metadata: {
        site: 'streambackdrops',
        product_type: 'subscription',
      },
      success_url: `${req.headers.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/hd`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
}
