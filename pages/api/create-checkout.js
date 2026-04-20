import Stripe from "stripe";
import { getProduct } from "../../lib/products";

const testKey = process.env.STRIPE_SECRET_KEY_TEST;
const liveKey = process.env.STRIPE_SECRET_KEY;

console.log("🔑 testKey exists:", !!testKey);
console.log("🔑 liveKey exists:", !!liveKey);
console.log("🧪 STRIPE_MODE:", process.env.STRIPE_MODE);

const mode = process.env.STRIPE_MODE || "live";
const key = mode === "test" ? testKey : liveKey;

console.log("🔑 USING KEY PREFIX:", key?.slice(0, 10));

if (!key) {
  throw new Error(`Missing Stripe secret key for mode: ${mode}`);
}

const stripe = new Stripe(key);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { priceId, productId } = req.body;

  console.log("📦 priceId:", priceId);
  console.log("🖼 productId:", productId);

  if (!priceId || !productId) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  const product = getProduct(productId);
  if (!product) {
    return res.status(400).json({ error: `Unknown product: ${productId}` });
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
        product_id: productId,
      },
    });

    console.log("💳 Stripe session created:", session.id);
    console.log("🔗 Stripe session url:", session.url);

    if (!session?.url) {
      console.error("❌ Stripe session missing URL:", session);
      return res.status(500).json({ error: "Stripe session missing URL" });
    }

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("❌ FULL STRIPE ERROR:", {
      message: error.message,
      type: error.type,
      code: error.code,
    });

    return res.status(500).json({
      error: error.message || "Checkout failed",
    });
  }
}
