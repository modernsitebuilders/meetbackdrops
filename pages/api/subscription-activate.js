import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { google } from 'googleapis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function addToEmailList(email) {
  try {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Check for duplicate
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Email List!A:A',
    });
    const emails = existing.data.values || [];
    const alreadyExists = emails.some(row => row[0] === email);
    if (alreadyExists) return;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Email List!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          email,
          'Subscriber',
          new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
          }),
        ]],
      },
    });
  } catch (err) {
    console.error('Email List write failed:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.body;
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const customer = session.customer;
    const customerId = typeof customer === 'string' ? customer : customer.id;
    const email = typeof customer === 'string' ? session.customer_details?.email : customer.email;

    const subscription = session.subscription;
    const periodStart = typeof subscription === 'string'
      ? (await stripe.subscriptions.retrieve(subscription)).current_period_start
      : subscription.current_period_start;

    // Generate token (30-day TTL)
    const token = crypto.randomUUID();
    await redis.set(
      `sub_token:${token}`,
      { customerId, email },
      { ex: 30 * 24 * 60 * 60 }
    );

    // Cache subscription status
    await redis.set(
      `sub_status:${customerId}`,
      { active: true, periodStart },
      { ex: 3600 }
    );

    // Add email to Email List sheet (fire-and-forget, deduped)
    if (email) addToEmailList(email).catch(() => {});

    // The hd_subscription revenue event is recorded server-side by the Stripe
    // webhook (pages/api/stripe-webhook.js) — not here, so it isn't double-counted
    // and doesn't depend on the buyer reaching /subscription-success.

    return res.status(200).json({ token, email });

  } catch (error) {
    console.error('Subscription activate error:', error);
    return res.status(500).json({ error: 'Activation failed' });
  }
}
