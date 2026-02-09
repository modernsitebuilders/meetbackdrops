export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const debugInfo = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasGoogleEmail: !!process.env.GOOGLE_SERVICE_EMAIL,
    hasGoogleSheetId: !!process.env.GOOGLE_SHEET_ID,
    hasGooglePrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    userAgent: req.headers['user-agent'],
    referer: req.headers['referer']
  };

  console.log('🔍 Debug tracking info:', debugInfo);
  
  res.status(200).json(debugInfo);
}