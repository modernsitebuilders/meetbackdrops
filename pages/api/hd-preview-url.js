import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageId } = req.query;

  if (!imageId) {
    return res.status(400).json({ error: 'Missing imageId' });
  }

  try {
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: 'streambackdrops-premium',
      Key: `${imageId}.png`,
      Expires: 600, // 10 minutes — enough for viewing the comparison widget
    });

    return res.status(200).json({ url: signedUrl });

  } catch (error) {
    console.error('HD preview URL error:', error);
    return res.status(500).json({ error: 'Failed to generate preview URL' });
  }
}
