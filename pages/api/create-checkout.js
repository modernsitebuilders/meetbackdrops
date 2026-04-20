import Stripe from "stripe";

const isTest = process.env.STRIPE_MODE === "test";

// 🧠 DEBUG: environment visibility (safe to remove later)
console.log("🔧 STRIPE_MODE:", process.env.STRIPE_MODE);
console.log("🔑 TEST KEY EXISTS:", !!process.env.STRIPE_SECRET_KEY_TEST);
console.log("🔑 LIVE KEY EXISTS:", !!process.env.STRIPE_SECRET_KEY);

const key = isTest
  ? process.env.STRIPE_SECRET_KEY_TEST
  : process.env.STRIPE_SECRET_KEY;

// 🧠 HARD FAIL IF MISCONFIGURED (prevents silent Stripe crash)
if (!key) {
  throw new Error(
    `Missing Stripe secret key for mode: ${isTest ? "test" : "live"}`
  );
}

const stripe = new Stripe(key);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { priceId, selectedImages } = req.body;

  // 🧠 DEBUG: incoming payload
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

    // 🧠 DEBUG: Stripe response
    console.log("💳 Stripe session created:", {
      id: session.id,
      url: session.url,
    });

    // 🧠 CRITICAL SAFETY CHECK
    if (!session?.url) {
      console.error("❌ Stripe session missing URL:", session);
      return res.status(500).json({ error: "Stripe session missing URL" });
    }

    return res.status(200).json({ url: session.url });

  } catch (error) {
    // 🧠 DEBUG: full Stripe error
    console.error("❌ Stripe checkout error:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({ error: "Checkout failed" });
  }
}