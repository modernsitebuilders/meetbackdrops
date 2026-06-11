import Stripe from "stripe";
import { getProduct } from "../../lib/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// All price IDs live server-side only — never sent to the client.
const PRICE_IDS = {
  1:  process.env.STRIPE_PRICE_1  || 'price_1Sr4U0Q695ongkMjxUtnf9NA',
  2:  process.env.STRIPE_PRICE_2  || 'price_1Sr4VEQ695ongkMjkaclxw67',
  3:  process.env.STRIPE_PRICE_3  || 'price_1Sr4WYQ695ongkMjRUTPsoIr',
  5:  process.env.STRIPE_PRICE_5  || 'price_1TDoudQ695ongkMj0hGBVZfc',
  10: process.env.STRIPE_PRICE_10 || 'price_1TDovCQ695ongkMjnZptC1zz',
  20: process.env.STRIPE_PRICE_20 || 'price_1TDowHQ695ongkMjwk1xZFAO',
};

const PACK_SIZES = [1, 2, 3, 5, 10, 20];

function resolvePriceId(count) {
  const tier = PACK_SIZES.find(s => s >= count) ?? 20;
  return PRICE_IDS[tier];
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { productIds } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: "productIds must be a non-empty array" });
  }

  const ids = productIds;

  // Validate all products exist
  for (const id of ids) {
    if (!getProduct(id)) {
      return res.status(400).json({ error: `Unknown product: ${id}` });
    }
  }

  const priceId = resolvePriceId(ids.length);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // No payment_method_types: let Stripe Checkout show every method enabled in
      // the Dashboard (cards, wallets like Apple/Google Pay & Link, plus Cash App
      // Pay, Klarna, Affirm, Amazon Pay, etc.), optimized per customer/locale/device.
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/hd-download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/hd`,
      // Generate a hosted Stripe invoice with PDF and email it to the buyer.
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: ids.length === 1
            ? "MeetBackdrops HD background download"
            : `MeetBackdrops HD background bundle (${ids.length} downloads)`,
          metadata: {
            site: "streambackdrops",
            product_type: "hd_image",
            product_ids: ids.join(","),
          },
          footer: "Thanks for your purchase. Questions? info@meetbackdrops.com",
        },
      },
      metadata: {
        site: "streambackdrops",
        product_type: "hd_image",
        product_ids: ids.join(","),
        // Keep product_id singular for single-item backwards compat
        ...(ids.length === 1 ? { product_id: ids[0] } : {}),
      },
    });

    if (!session?.url) {
      return res.status(500).json({ error: "Stripe session missing URL" });
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return res.status(500).json({ error: error.message || "Checkout failed" });
  }
}
