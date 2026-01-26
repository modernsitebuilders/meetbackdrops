import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await execAsync('node scripts/update-cache.js');
    res.status(200).json({ success: true, updated: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}