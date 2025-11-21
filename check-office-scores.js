const https = require('https');

https.get('https://streambackdrops.com/api/calculate-scores', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const json = JSON.parse(data);
    const officeSpaces = Object.entries(json.scores)
      .filter(([_, v]) => v.categorySlug === 'office-spaces')
      .sort((a, b) => b[1].score - a[1].score)
      .map(([filename, stats], index) => ({
        rank: index + 1,
        filename,
        score: stats.score,
        downloads: stats.downloads,
        pageviews: stats.pageviews,
        recentDownloads: stats.recentDownloads,
        daysOld: stats.daysOld
      }));
    
    console.log('\n=== OFFICE SPACES IMAGE SCORES ===');
    console.log(`Total images: ${officeSpaces.length}\n`);
    
    officeSpaces.forEach(img => {
      console.log(`${img.rank}. ${img.filename}`);
      console.log(`   Score: ${img.score} | Downloads: ${img.downloads} | Views: ${img.pageviews} | Recent: ${img.recentDownloads}`);
      console.log('');
    });
  });
});