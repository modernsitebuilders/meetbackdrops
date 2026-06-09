const fs = require("fs");
const path = require("path");

// 1. YOUR SELECTED IMAGES (EDIT THIS LIST)
const images = [
  "office-spaces-19.webp",
  "office-spaces-69.webp",
  "office-spaces-35.webp",
  "bookshelves-bright-01.webp",
  "bookshelves-bright-42.webp",
  "bookshelves-dark-27.webp",
  "wall-shelves-bright-16.webp",
  "wall-shelves-bright-02.webp",
  "wall-shelves-bright-54.webp",
  "library-17.webp",
  "bookshelves-bright-20.webp",
  "office-spaces-02.webp"
];

// 2. CATEGORY MAP (based on filename prefix)
function getCategory(file) {
  if (file.includes("office-spaces")) return "Office Spaces";
  if (file.includes("bookshelves")) return "Bookshelves";
  if (file.includes("wall-shelves")) return "Wall Shelves";
  if (file.includes("library")) return "Libraries";
  return "Virtual Backgrounds";
}

// 3. BUILD SEO TITLE
function makeTitle(file) {
  const category = getCategory(file);
  const clean = file.replace(".webp", "").replace(/-/g, " ");
  return `Professional ${clean} Zoom Background | ${category}`;
}

// 4. BUILD DESCRIPTION
function makeDesc(file) {
  const category = getCategory(file);
  return `High-quality ${category.toLowerCase()} virtual background for Zoom, Teams, and Google Meet. Perfect for remote work, meetings, and professional setups. Keywords: ${category.toLowerCase()}, zoom background, virtual background, remote work`;
}

// 5. BUILD IMAGE URL
function makeImage(file) {
  const folder = file.split("-").slice(0, 2).join("-"); 
  return `https://assets.streambackdrops.com/webp/${folder}/${file}`;
}

// 6. BUILD LINK
function makeLink(file) {
  const category = getCategory(file);
  const slug = category.toLowerCase().replace(/\s+/g, "-");
  return `https://meetbackdrops.com/category/${slug}`;
}

// 7. BUILD CSV
const header = `"Title","Description","Image","Link","Board"`;

const rows = images.map(file => {
  const title = makeTitle(file);
  const desc = makeDesc(file);
  const img = makeImage(file);
  const link = makeLink(file);
  const board = getCategory(file);

  return `"${title}","${desc}","${img}","${link}","${board}"`;
});

const csv = [header, ...rows].join("\n");

// 8. WRITE FILE
const outputPath = path.join(__dirname, "../pinterest-engine/output/tailwind-test-12.csv");
fs.writeFileSync(outputPath, csv);

console.log("✅ Tailwind CSV generated:");
console.log(outputPath);