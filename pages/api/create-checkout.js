import Stripe from "stripe";

const testKey = process.env.STRIPE_SECRET_KEY_TEST;
const liveKey = process.env.STRIPE_SECRET_KEY;

console.log("🔑 testKey exists:", !!testKey);
console.log("🔑 liveKey exists:", !!liveKey);

// ⚠️ IMPORTANT: you were NOT using testKey at all before
// This is the correct safe selection logic
const key =
  process.env.STRIPE_MODE === "test"
    ? testKey
    : liveKey;

if (!key) {
  throw new Error("Missing Stripe secret key (test or live)");
}

const stripe = new Stripe(key);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { priceId, selectedImages } = req.body;

  console.log("📦 priceId:", priceId);
  console.log("🖼 selectedImages:", selectedImages);

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
        product_ids: JSON.stringify(selectedImages),
        primary_product_id: selectedImages?.[0] || "unknown",
      },
    });

    console.log("💳 Stripe session created:", session.id);
    console.log("🔗 Stripe session url:", session.url);

    // 🚨 CRITICAL SAFETY GUARD (prevents /undefined redirect)
    if (!session || !session.url) {
      console.error("❌ Stripe session missing URL:", session);
      return res.status(500).json({
        error: "Stripe session missing URL",
      });
    }

    return res.status(200).json({
      url: session.url,
    });

  } catch (error) {
    console.error("❌ Stripe checkout error:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({ error: "Checkout failed" });
  }
}