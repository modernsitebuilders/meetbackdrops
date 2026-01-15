// test-create-one.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testCreate() {
  const token = process.env.GUMROAD_ACCESS_TOKEN;
  
  console.log('Testing product creation...\n');
  
  // Try method 1: URLSearchParams
  const response1 = await fetch(`https://api.gumroad.com/v2/products?access_token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      name: 'TEST Product',
      price: '499'
    })
  });
  
  console.log('Method 1 (query param) status:', response1.status);
  const text1 = await response1.text();
  console.log('Response:', text1.substring(0, 300));
  
  // Try method 2: JSON body
  console.log('\n---\n');
  
  const response2 = await fetch('https://api.gumroad.com/v2/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'TEST Product 2',
      price: 499
    })
  });
  
  console.log('Method 2 (JSON) status:', response2.status);
  const text2 = await response2.text();
  console.log('Response:', text2.substring(0, 300));
}

testCreate();