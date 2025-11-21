const https = require('https');

https.get('https://streambackdrops.com/api/calculate-scores', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const json = JSON.parse(data);
    
    // Check BOTH .png and .webp versions
    const png = json.scores['office-spaces-24.png'];
    const webp = json.scores['office-spaces-24.webp'];
    
    console.log('\n=== OFFICE-SPACES-24 COMPARISON ===\n');
    console.log('PNG version (.png):');
    console.log(png ? JSON.stringify(png, null, 2) : 'NOT FOUND');
    console.log('\nWEBP version (.webp):');
    console.log(webp ? JSON.stringify(webp, null, 2) : 'NOT FOUND');
  });
});