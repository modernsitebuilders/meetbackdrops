export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sale_id } = req.body;

  if (!sale_id) {
    return res.status(400).json({ error: 'Missing sale_id' });
  }

  try {
    // Verify with Gumroad API
    const response = await fetch(`https://api.gumroad.com/v2/sales/${sale_id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GUMROAD_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      return res.status(400).json({ verified: false, error: 'Invalid sale' });
    }

    const data = await response.json();
    
    // Check sale is valid and not refunded
    if (data.success && !data.sale.refunded && !data.sale.disputed) {
      return res.status(200).json({ 
        verified: true,
        product_name: data.sale.product_name,
        email: data.sale.email
      });
    }

    return res.status(400).json({ verified: false, error: 'Sale not valid' });

  } catch (error) {
    console.error('Gumroad verification failed:', error);
    return res.status(500).json({ verified: false, error: 'Verification failed' });
  }
}