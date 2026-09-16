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

// Stripe caps each metadata VALUE at 500 chars. HD product ids are long
// descriptive slugs (~42-72 chars each), so a 10- or 20-pack comfortably
// overflows a single joined product_ids string (a 20-pack is ~1,460 chars) and
// stripe.checkout.sessions.create() would throw, failing checkout for large
// bundles. Split the id list across numbered keys — product_ids, product_ids_2,
// product_ids_3, … — each kept under 500 chars and never splitting an
// individual id, so the full list is recovered verbatim server-side.
// stripe-webhook.js reassembles them (must stay in sync with this encoding).
const MAX_METADATA_VALUE = 500;

function productIdMetadata(ids) {
  const meta = {};
  let chunkIndex = 0;
  let current = "";
  const flush = () => {
    const key = chunkIndex === 0 ? "product_ids" : `product_ids_${chunkIndex + 1}`;
    meta[key] = current;
    chunkIndex += 1;
    current = "";
  };
  for (const id of ids) {
    const next = current ? `${current},${id}` : id;
    if (next.length > MAX_METADATA_VALUE && current) {
      flush();
      current = id;
    } else {
      current = next;
    }
  }
  if (current) flush();
  return meta;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { productIds, analytics } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: "productIds must be a non-empty array" });
  }

  const ids = productIds;

  // Carry the buyer's first-party analytics attribution (session id, visitor id,
  // original source, landing page) INTO the Stripe session metadata so the webhook
  // — the reliable, server-side, ad-blocker-proof record of the sale — can emit a
  // fully-attributed `hd_purchase` event. Without this the webhook still records the
  // sale, but as source 'direct'/unknown. Stripe metadata values are strings ≤500
  // chars; we truncate defensively and drop empties. See pages/api/stripe-webhook.js.
  const a = analytics && typeof analytics === "object" ? analytics : {};
  const metaStr = (v) => (v == null ? "" : String(v).slice(0, 480));
  const analyticsMeta = {};
  if (metaStr(a.sessionId))   analyticsMeta.a_sid   = metaStr(a.sessionId);
  if (metaStr(a.visitorId))   analyticsMeta.a_vid   = metaStr(a.visitorId);
  if (metaStr(a.originalSource)) analyticsMeta.a_src = metaStr(a.originalSource);
  if (metaStr(a.landingPage)) analyticsMeta.a_land  = metaStr(a.landingPage);
  if (metaStr(a.visitorType)) analyticsMeta.a_vtype = metaStr(a.visitorType);
  if (a.pageViews != null)    analyticsMeta.a_pv    = metaStr(a.pageViews);

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
      // The Stripe account is Modern Site Builders, so its default card statement
      // descriptor is MODERNSITEBUILDERS.COM. Card charges can't override the full
      // descriptor, only append a suffix to the account's shortened prefix
      // (Dashboard → Settings → Public details), so buyers see "<PREFIX>* MEETBACKDROPS".
      payment_intent_data: { statement_descriptor_suffix: "MEETBACKDROPS" },
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
            ...productIdMetadata(ids),
          },
          footer: "Thanks for your purchase. Questions? info@meetbackdrops.com",
        },
      },
      metadata: {
        site: "streambackdrops",
        product_type: "hd_image",
        ...productIdMetadata(ids),
        // Keep product_id singular for single-item backwards compat
        ...(ids.length === 1 ? { product_id: ids[0] } : {}),
        // Buyer attribution for the webhook's server-side hd_purchase record.
        ...analyticsMeta,
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
