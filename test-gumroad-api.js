// test-gumroad-api.js
require('dotenv').config({ path: '.env.local' });

console.log('Token exists:', !!process.env.GUMROAD_ACCESS_TOKEN);
console.log('Token length:', process.env.GUMROAD_ACCESS_TOKEN?.length);
console.log('First 10 chars:', process.env.GUMROAD_ACCESS_TOKEN?.substring(0, 10));

// Test simple API call
const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('https://api.gumroad.com/v2/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.GUMROAD_ACCESS_TOKEN}`
      }
    });
    
    console.log('\nAPI Response Status:', response.status);
    const text = await response.text();
    console.log('Response (first 200 chars):', text.substring(0, 200));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();