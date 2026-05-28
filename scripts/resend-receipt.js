/**
 * Resend a Stripe receipt for a recent MeetBackdrops purchase.
 *
 * Usage:
 *   node scripts/resend-receipt.js <email> [--days=2]
 *
 * Looks back over the most recent N days (default 2) of Stripe Checkout
 * sessions in LIVE mode, finds completed payments whose customer email
 * matches, and triggers Stripe to (re)send the receipt by updating the
 * underlying charge's `receipt_email`. Per Stripe API docs, updating
 * `receipt_email` causes a new receipt email to be sent.
 *
 * Reads STRIPE_SECRET_KEY from .env.local — uses live mode regardless of
 * STRIPE_MODE, since real-customer receipts always come from live charges.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const Stripe = require('stripe');

function parseArgs(argv) {
  const args = { email: null, days: 2 };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--days=')) args.days = parseInt(a.split('=')[1], 10) || 2;
    else if (!args.email) args.email = a;
  }
  return args;
}

async function main() {
  const { email, days } = parseArgs(process.argv);

  if (!email) {
    console.error('Usage: node scripts/resend-receipt.js <email> [--days=2]');
    process.exit(1);
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith('sk_live_')) {
    console.error('STRIPE_SECRET_KEY missing or not a live key in .env.local');
    process.exit(1);
  }

  const stripe = new Stripe(key);
  const target = email.toLowerCase().trim();
  const since = Math.floor(Date.now() / 1000) - days * 86400;

  console.log(`Looking for completed checkout sessions for "${target}" in the last ${days} day(s)…`);

  const matches = [];
  let starting_after;
  let scanned = 0;

  // Iterate recent checkout sessions; stop once we drop below the time window.
  while (true) {
    const page = await stripe.checkout.sessions.list({
      limit: 100,
      ...(starting_after ? { starting_after } : {}),
    });

    for (const s of page.data) {
      scanned++;
      if (s.created < since) {
        starting_after = null;
        break;
      }
      const sEmail = (s.customer_details?.email || s.customer_email || '').toLowerCase().trim();
      if (sEmail === target && s.payment_status === 'paid' && s.mode === 'payment') {
        matches.push(s);
      }
    }

    if (!page.has_more || !page.data.length || page.data[page.data.length - 1].created < since) break;
    starting_after = page.data[page.data.length - 1].id;
  }

  console.log(`Scanned ${scanned} sessions, found ${matches.length} match(es).`);

  if (matches.length === 0) {
    console.log('No matching paid checkout sessions found.');
    console.log('Try a wider window with --days=N, or check the email spelling.');
    process.exit(0);
  }

  for (const session of matches) {
    console.log('---');
    console.log('Session:        ', session.id);
    console.log('Created:        ', new Date(session.created * 1000).toISOString());
    console.log('Amount total:   ', (session.amount_total / 100).toFixed(2), session.currency?.toUpperCase());
    console.log('Customer email: ', session.customer_details?.email);
    console.log('Product IDs:    ', session.metadata?.product_ids || '(none)');

    if (!session.payment_intent) {
      console.log('  (no payment_intent attached — skipping)');
      continue;
    }

    const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
      expand: ['latest_charge'],
    });
    const charge = pi.latest_charge;
    if (!charge) {
      console.log('  (no latest_charge on payment_intent — skipping)');
      continue;
    }

    console.log('Charge:         ', charge.id);
    console.log('Current receipt_email:', charge.receipt_email || '(none)');

    // Setting receipt_email on a charge triggers Stripe to send a receipt.
    // We set it to the customer-entered email so the receipt definitely lands.
    const recipient = session.customer_details?.email || email;
    const updated = await stripe.charges.update(charge.id, { receipt_email: recipient });
    console.log(`✓ Receipt email triggered to: ${updated.receipt_email}`);
    if (updated.receipt_url) {
      console.log(`  Hosted receipt URL: ${updated.receipt_url}`);
    }
  }

  console.log('---');
  console.log('Done. Stripe will deliver the receipt within ~1 minute.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
