const fs = require('fs');
const path = require('path');

// Correct alt texts based on verified display positions
const newAlts = {
  "christmas-backgrounds-01": "Elegant Christmas living room with cream tufted sofa ornate fireplace mantel burgundy velvet pillows decorated tree and oriental rug traditional luxury cozy warm fireplace plants",
  "christmas-backgrounds-02": "Bright farmhouse room with natural wood dressers evergreen Christmas wreath on white shiplap walls and small potted Christmas tree bright cozy plants wood",
  "christmas-backgrounds-03": "Festive farmhouse kitchen with light pine cabinets white countertops red plaid towel and Christmas decorations near snowy windows bright cozy plants windows",
  "christmas-backgrounds-04": "Modern Christmas living room with gray sectional sofa red knit throw blanket small decorated tree and natural window light modern cozy plants natural light",
  "christmas-backgrounds-05": "Minimalist Christmas setting with gray linen bench vibrant red throw blanket small evergreen tree and clean white walls minimalist bright cozy plants",
  "christmas-backgrounds-06": "Bright white living room with slipcovered sofa bold red Christmas throw white pillows and small decorated Christmas tree bright cozy plants",
  "christmas-backgrounds-07": "Cozy dark Christmas living room with chocolate brown furniture evergreen garland over doorway and glowing Christmas tree lights dark cozy warm plants",
  "christmas-backgrounds-08": "Warm Christmas scene featuring stack of wrapped holiday presents with ribbons and bows under soft ambient lighting warm cozy",
  "christmas-backgrounds-09": "Evening Christmas living room with cream sectional burgundy accent pillows illuminated Christmas tree and candlelit coffee table cozy warm plants",
  "christmas-backgrounds-10": "Christmas reading nook with white built-in bookshelves evergreen wreath burgundy armchair and cottage-style decor cozy plants bookshelf",
  "christmas-backgrounds-11": "Elegant home library with slate blue built-in shelves Christmas wreath with red velvet bow and colorful book collection cozy bookshelf plants",
  "christmas-backgrounds-12": "Modern rustic Christmas space with white pallet furniture burgundy velvet pillows potted evergreen tree and floating shelves modern cozy plants wood",
  "christmas-backgrounds-13": "Comfortable basement Christmas living room with tan sectional sofa decorated tree and natural light from above-grade windows cozy plants natural light",
  "christmas-backgrounds-14": "Classic white Christmas living room with cream sofa distressed white coffee table red candles and fully decorated tree traditional bright cozy plants warm",
  "christmas-backgrounds-15": "Bright modern Christmas kitchen with white cabinets evergreen wreath holiday place settings and red accent decorations modern bright cozy plants",
  "christmas-backgrounds-16": "Contemporary white Christmas home office with desk white chair flanking evergreen trees wreath and red throw accent modern bright cozy plants office",
  "christmas-backgrounds-17": "Farmhouse Christmas living room with cream furniture plaid red accents tabletop tree evergreen garland and neutral textiles traditional cozy warm plants",
  "christmas-backgrounds-18": "Traditional Christmas living room with gray sectional red and green plaid throw illuminated Christmas tree and holiday decor traditional cozy warm plants",
  "christmas-backgrounds-19": "Festive Christmas dining area with white farmhouse table evergreen garland runner red chairs and holiday centerpiece decorations cozy warm plants wood",
  "christmas-backgrounds-20": "Elegant white Christmas living room with tufted sofa ivory pillows red throw blanket decorated tree and romantic candlelight traditional bright cozy warm plants",
  "christmas-backgrounds-21": "Coastal Christmas living room with white furniture small potted evergreen tree wreath navy and blue accent pillows and light natural wood floors bright cozy plants wood",
  "christmas-backgrounds-22": "Bright winter Christmas living room with white slipcovered sofa fully decorated Christmas tree striped pillows and gray coffee table in natural light bright cozy plants natural light",
  "christmas-backgrounds-23": "Festive home office desk with colorful book collection evergreen Christmas garland with lights burgundy velvet pillow and Santa hat decoration cozy warm plants bookshelf office",
  "christmas-backgrounds-24": "Modern gray Christmas office with sleek white desk dual computer monitors evergreen garland above and contemporary minimalist design modern cozy plants office",
  "christmas-backgrounds-25": "Neutral Christmas living room with cream sectional sofa burgundy plaid throw blanket white pillow candles on coffee table and understated holiday decor cozy warm",
  "christmas-backgrounds-26": "Cozy Christmas living room with gray sofa festive plaid and snowflake pillows decorated Christmas tree wreaths and warm holiday atmosphere cozy warm plants",
  "christmas-backgrounds-27": "Contemporary Christmas space with gray sectional chaise red buffalo plaid throw illuminated Christmas tree wreath and wooden trunk coffee table modern cozy warm plants wood",
  "christmas-backgrounds-28": "Modern Christmas living room with gray L-shaped sectional red buffalo plaid accent pillows glowing Christmas tree and wrapped gift boxes modern cozy warm plants",
  "christmas-backgrounds-29": "Winter porch Christmas setting with white outdoor furniture burgundy throw blankets evergreen planters Christmas trees and seasonal decor bright cozy warm plants",
  "christmas-backgrounds-30": "Contemporary Christmas living room with chocolate brown leather sectional wood coffee table colorful geometric rug and festive holiday decorations modern cozy warm plants wood",
  "christmas-backgrounds-31": "Farmhouse Christmas living room with white slipcovered sofa evergreen garland over mantel burgundy and pink throws and bright window light traditional bright cozy warm plants fireplace",
  "christmas-backgrounds-32": "Elegant jewel-tone Christmas space with teal and burgundy velvet chairs gold glass coffee table decorated tree and romantic candlelight luxury cozy warm plants",
  "christmas-backgrounds-33": "Luxurious emerald green velvet sofa with draped Christmas garland gold metallic accents round table and sophisticated holiday styling luxury cozy warm plants",
  "christmas-backgrounds-34": "Modern minimalist Christmas living room with caramel tan leather sofa natural wood coffee table evergreen wreath and clean neutral palette modern minimalist cozy plants wood",
  "christmas-backgrounds-35": "Rustic log cabin Christmas living room with brown leather furniture natural wood walls plaid pillows decorated tree and cozy mountain lodge atmosphere traditional cozy warm plants wood",
  "christmas-backgrounds-36": "Modern gray Christmas kitchen with white countertops evergreen wreaths in windows gray shaker cabinets and holiday window decorations modern bright cozy plants windows",
  "christmas-backgrounds-37": "Contemporary gray Christmas living room with L-shaped sectional sofa small decorated Christmas tree burgundy velvet pillow and modern neutral decor modern cozy plants",
  "christmas-backgrounds-38": "Elegant mint green console table with multiple Christmas wreaths white table lamp burgundy velvet accent chair and tall decorated Christmas tree traditional bright cozy plants",
  "christmas-backgrounds-39": "Rustic log cabin Christmas living room with brown leather furniture natural wood walls illuminated Christmas tree and cozy mountain lodge atmosphere traditional cozy warm plants wood",
  "christmas-backgrounds-40": "Dramatic dark Christmas living room with gray sofa antler wall decor burgundy throw white fur accents and moody festive styling dark cozy warm",
  "christmas-backgrounds-41": "Rustic reclaimed wood Christmas porch with weathered bench jewel-tone velvet pillows flanking Christmas trees and vintage holiday charm traditional cozy plants wood",
  "christmas-backgrounds-42": "Farmhouse Christmas kitchen with cream shaker cabinets white pendant lights open shelving with holiday decor and traditional country styling traditional bright cozy plants",
  "christmas-backgrounds-43": "Rustic Christmas living room with beige sectional sofa red and green plaid throw distressed wood coffee table and fresh holiday greenery traditional cozy warm plants wood",
  "christmas-backgrounds-44": "Clean modern Christmas space with light gray sofa evergreen garland swag above red buffalo plaid pillow and minimalist holiday decor modern bright cozy minimalist plants",
  "christmas-backgrounds-45": "Traditional Christmas library with burgundy leather furniture glowing fireplace decorated tree lanterns and warm classic holiday atmosphere traditional cozy warm plants fireplace bookshelf",
  "christmas-backgrounds-46": "Modern Christmas office with illuminated gray shelving burgundy accent chair small decorated tree and contemporary professional design modern cozy plants office"
};

// Read metadata file
const metadataPath = path.join(process.cwd(), 'public', 'data', 'image-metadata-complete.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Update alt texts
let updateCount = 0;
Object.keys(newAlts).forEach(key => {
  if (metadata[key]) {
    metadata[key].alt = newAlts[key];
    updateCount++;
    console.log(`✓ Updated ${key}`);
  } else {
    console.log(`✗ Not found: ${key}`);
  }
});

// Write back to file
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

console.log(`\n✅ Updated ${updateCount} of 46 Christmas alt texts`);
console.log(`📝 File: public/data/image-metadata-complete.json\n`);