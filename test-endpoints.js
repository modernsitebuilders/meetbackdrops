// test-endpoints.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const token = process.env.GUMROAD_ACCESS_TOKEN;

async function testEndpoints() {
  const endpoints = [
    'https://api.gumroad.com/v2/products',
    'https://api.gumroad.com/v3/products',
    'https://api.gumroad.com/products',
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\nTesting: ${endpoint}`);
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('GET Status:', response.status);
    
    if (response.status === 200) {
      console.log('✓ This endpoint works for GET');
      
      // Try POST
      const postResp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'Test', price: 499 })
      });
      console.log('POST Status:', postResp.status);
    }
  }
}

testEndpoints();