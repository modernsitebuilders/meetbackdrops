// pages/api/tracking-status.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    sheetsConfigured: !!process.env.GOOGLE_SHEET_ID,
    serviceEmail: process.env.GOOGLE_SERVICE_EMAIL ? 'configured' : 'missing',
    privateKey: process.env.GOOGLE_PRIVATE_KEY ? 'configured' : 'missing'
  });
}