const https = require('https');

// Fetch scores from your API endpoint
function getScores() {
  return new Promise((resolve, reject) => {
    https.get('https://streambackdrops.com/api/calculate-scores', (resp) => {
      let data = '';
      
      resp.on('data', (chunk) => {
        data += chunk;
      });
      
      resp.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.scores);
        } catch (e) {
          reject(e);
        }
      });
      
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log('\n🎄 Fetching Christmas backgrounds in display order...\n');
  
  const scores = await getScores();
  
  // Filter for christmas backgrounds and sort by score (highest first)
  const christmasImages = Object.entries(scores)
    .filter(([filename, data]) => data.categorySlug === 'christmas-backgrounds')
    .sort((a, b) => b[1].score - a[1].score);
  
  console.log('TOP 16 (what you see in screenshot):\n');
  christmasImages.slice(0, 16).forEach(([filename, data], index) => {
    const displayNum = index + 1;
    const strippedName = filename.replace(/\.(webp|png)$/, '');
    console.log(`Position ${displayNum}: ${strippedName} (score: ${data.score}, downloads: ${data.downloads})`);
  });
  
  console.log('\n─────────────────────────────────────\n');
  console.log('ALL IMAGES (display order):\n');
  christmasImages.forEach(([filename, data], index) => {
    const displayNum = index + 1;
    const strippedName = filename.replace(/\.(webp|png)$/, '');
    console.log(`${displayNum}. ${strippedName} (score: ${data.score}, downloads: ${data.downloads})`);
  });
  
  console.log(`\n✅ Total: ${christmasImages.length} images\n`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});