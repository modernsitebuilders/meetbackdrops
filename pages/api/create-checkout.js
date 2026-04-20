import Stripe from "stripe";

const testKey = process.env.STRIPE_SECRET_KEY_TEST;
const liveKey = process.env.STRIPE_SECRET_KEY;

// 🔴 DEBUG (safe to keep temporarily)
console.log("🔑 testKey exists:", !!testKey);
console.log("🔑 liveKey exists:", !!liveKey);
console.log("🧪 STRIPE_MODE:", process.env.STRIPE_MODE);

// ⚠️ FIX #1: fallback safety (prevents accidental undefined mode)
const mode = process.env.STRIPE_MODE || "live";

const key = mode === "test" ? testKey : liveKey;

// 🔴 DEBUG: confirm actual key being used
console.log("🔑 USING KEY PREFIX:", key?.slice(0, 10));

if (!key) {
  throw new Error(`Missing Stripe secret key for mode: ${mode}`);
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

    // ⚠️ FIX #2: safer guard (prevents undefined redirect bugs)
    if (!session?.url) {
      console.error("❌ Stripe session missing URL:", session);
      return res.status(500).json({
        error: "Stripe session missing URL",
      });
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