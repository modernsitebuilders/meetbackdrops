// This is the complete file - copy everything from here to the end

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Your Bing API key
  const apiKey = 'FE9180B910F8D83B232E915510BB8017';
  
  // IndexNow endpoint
  const indexNowUrl = 'https://api.indexnow.org/indexnow';
  
  try {
    const response = await fetch(indexNowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: 'streambackdrops.com',
        key: apiKey,
        urlList: [url]
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'URL submitted to IndexNow' });
    } else {
      return res.status(500).json({ error: 'Failed to submit to IndexNow' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error submitting to IndexNow' });
  }
}
