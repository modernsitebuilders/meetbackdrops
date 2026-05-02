// pages/api/health.js
export default function handler(req, res) {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'MeetBackdrops API is healthy'
  };
  
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(healthcheck);
}