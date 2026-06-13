import Stripe from "stripe";
import { getProduct } from "../../lib/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price IDs live server-side only. Create these two Products/Prices in the
// Stripe Dashboard and set the env vars in Vercel — there is intentionally NO
// hardcoded fallback so a misconfiguration fails closed rather than charging
// the wrong amount.
//   STRIPE_LICENSE_PRICE          → Extended License, one image      ($49 one-time)
//   STRIPE_LICENSE_LIBRARY_PRICE  → Commercial Library License       ($299 one-time, 12-mo term)
const LICENSE_PRICES = {
  image: process.env.STRIPE_LICENSE_PRICE,
  library: process.env.STRIPE_LICENSE_LIBRARY_PRICE,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { licenseType, productId } = req.body || {};

  if (licenseType !== "image" && licenseType !== "library") {
    return res.status(400).json({ error: "licenseType must be 'image' or 'library'" });
  }

  const priceId = LICENSE_PRICES[licenseType];
  if (!priceId) {
    console.error(`Missing Stripe price env for license type: ${licenseType}`);
    return res.status(500).json({ error: "License pricing is not configured. Please contact support." });
  }

  // Per-image extended license must reference a real HD product (we deliver the HD file).
  let product = null;
  if (licenseType === "image") {
    if (!productId) {
      return res.status(400).json({ error: "productId is required for a per-image license" });
    }
    product = getProduct(productId);
    if (!product) {
      return res.status(400).json({ error: `Unknown product: ${productId}` });
    }
  }

  const productType = licenseType === "image" ? "extended_license" : "commercial_library";
  const description = licenseType === "image"
    ? `MeetBackdrops Extended License — ${product.title} (single image)`
    : "MeetBackdrops Commercial Library License (12-month term, entire catalog)";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // Collect the legal name the license is issued to (printed on the certificate).
      custom_fields: [
        {
          key: "licensee",
          label: { type: "custom", custom: "Licensee (company or individual name)" },
          type: "text",
          optional: false,
        },
      ],
      billing_address_collection: "auto",
      success_url: `${req.headers.origin}/license-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/commercial-license`,
      // B2B buyers expect an invoice for the file — generate + email a PDF receipt.
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description,
          metadata: {
            site: "streambackdrops",
            product_type: productType,
            ...(product ? { product_ids: product.id } : {}),
          },
          footer: "Thanks for licensing with MeetBackdrops. Questions? info@meetbackdrops.com",
        },
      },
      metadata: {
        site: "streambackdrops",
        product_type: productType,
        license_type: licenseType,
        // product_ids lets the existing /api/hd-s3-download authorize the HD file
        // for a per-image license exactly as it does for an HD purchase.
        ...(product ? { product_ids: product.id, product_id: product.id } : {}),
      },
    });

    if (!session?.url) {
      return res.status(500).json({ error: "Stripe session missing URL" });
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("License checkout error:", error.message);
    return res.status(500).json({ error: error.message || "Checkout failed" });
  }
}
