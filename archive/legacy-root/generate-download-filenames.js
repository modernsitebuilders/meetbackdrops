const fs = require("fs");
const path = require("path");

// -----------------------------
// LOAD DATA
// -----------------------------
const data = require("./public/data/image-metadata-complete.json");

// -----------------------------
// OUTPUT FILE
// -----------------------------
const OUTPUT_FILE = "products_upload.csv";

// -----------------------------
// SAFE HELPERS
// -----------------------------
function safe(v) {
  return v === undefined || v === null ? "" : String(v);
}

// -----------------------------
// SLUGIFY (ONLY FOR CLEAN STRUCTURE)
// -----------------------------
function slugify(str) {
  if (!str) return "";

  return str
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// -----------------------------
// BUILD CLEAN DOWNLOAD FILENAME
// (keyword-driven, NOT sentence-based)
// -----------------------------
function buildDownloadFilename(item, index) {
  const category = safe(item.category).toLowerCase() || "image";

  const keywords = Array.isArray(item.keywords)
    ? item.keywords.map(k => k.toLowerCase())
    : [];

  const altWords = safe(item.alt)
    .toLowerCase()
    .split(" ")
    .filter(Boolean);

  const titleWords = safe(item.title)
    .toLowerCase()
    .split(" ")
    .filter(Boolean);

  // Merge all signals
  let combined = [...keywords, ...altWords, ...titleWords];

  // Remove noise words
  const stopWords = new Set([
    "virtual",
    "background",
    "zoom",
    "video",
    "call",
    "streaming",
    "professional",
    "image",
    "backgrounds"
  ]);

  combined = combined
    .filter(w => w && !stopWords.has(w))
    .filter(w => isNaN(w)) // remove pure numbers
    .slice(0, 6); // keep tight & consistent

  let slug = combined.join("-");

  if (!slug || slug.length < 3) {
    slug = `${category}-${index}`;
  }

  slug = slugify(slug);

  return `${category}-${slug}-${index}.png`;
}

// -----------------------------
// TRANSFORM DATA
// -----------------------------
const products = (data || []).map((item, index) => {
  const title = safe(item.title);
  const description = safe(item.description);
  const category = safe(item.category);
  const filename = safe(item.filename);

  const tags = Array.isArray(item.keywords)
    ? item.keywords.join(", ")
    : safe(item.keywords);

  return {
    Handle: title,
    Title: title,
    Body: description,
    Type: category,
    Tags: tags,
    "Image Src": filename,
    DownloadFilename: buildDownloadFilename(item, index)
  };
});

// -----------------------------
// CSV EXPORT
// -----------------------------
function toCSV(rows) {
  const headers = Object.keys(rows[0]);

  const escape = (val) => {
    const str = safe(val);
    if (str.includes(",") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  return [
    headers.join(","),
    ...rows.map(row => headers.map(h => escape(row[h])).join(","))
  ].join("\n");
}

// -----------------------------
// WRITE FILE
// -----------------------------
fs.writeFileSync(OUTPUT_FILE, toCSV(products));

console.log("✅ Done!");
console.log(`📦 Products: ${products.length}`);
console.log(`📄 Saved to: ${path.resolve(OUTPUT_FILE)}`);