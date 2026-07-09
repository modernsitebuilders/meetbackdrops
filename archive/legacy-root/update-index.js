const fs = require('fs');

const filePath = 'pages/index.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add bokeh card right after halloween card (before closing </div>)
content = content.replace(
  `        <Card href="/category/halloween-backgrounds" title="Halloween Backgrounds 🎃" description="Festive Halloween backgrounds with pumpkins" imageSrc="/images/halloween-backgrounds/halloween-background-11.webp" imageAlt="Halloween virtual background" navigate={navigate} count={CATEGORIES['halloween-backgrounds'].count} />
      </div>`,
  `        <Card href="/category/halloween-backgrounds" title="Halloween Backgrounds 🎃" description="Festive Halloween backgrounds with pumpkins" imageSrc="/images/halloween-backgrounds/halloween-background-11.webp" imageAlt="Halloween virtual background" navigate={navigate} count={CATEGORIES['halloween-backgrounds'].count} />
        <Card href="/category/bokeh-backgrounds" title="Bokeh Backgrounds" description="Beautiful bokeh light effects with artistic blur for elegant calls" imageSrc="/images/bokeh-backgrounds/bokeh-1.webp" imageAlt="Bokeh virtual background" navigate={navigate} count={CATEGORIES['bokeh-backgrounds'].count} />
      </div>`
);

fs.writeFileSync(filePath, content);
console.log('✓ Updated pages/index.js');
