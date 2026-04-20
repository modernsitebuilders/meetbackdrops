import Stripe from "stripe";

const isTest = process.env.STRIPE_MODE === 'test';

const stripe = new Stripe(
  isTest
    ? process.env.STRIPE_SECRET_KEY_TEST
    : process.env.STRIPE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { priceId, selectedImages } = req.body;

  if (!priceId || !Array.isArray(selectedImages)) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/hd-download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/hd`,

      metadata: {
        product_type: "hd_image",
        product_ids: JSON.stringify(selectedImages || []),
        primary_product_id: selectedImages?.[0] || "unknown",
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Checkout failed" });
  }
}