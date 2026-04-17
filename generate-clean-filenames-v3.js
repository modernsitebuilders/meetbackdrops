// generate-clean-filenames.js

const fs = require("fs");

// -----------------------------
// CONFIG
// -----------------------------
const INPUT_FILE = "./products.json";   // change if needed
const OUTPUT_FILE = "./products_upload.csv";

// boilerplate keywords to remove
const STOP_WORDS = new Set([
  "virtual background",
  "zoom background",
  "video call",
  "streaming"
]);

// -----------------------------
// SAFE SLUGIFY
// -----------------------------
function slugify(str) {
  if (!str || typeof str !== "string") return "";

  return str
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// -----------------------------
// CLEAN KEYWORDS → usable tokens
// -----------------------------
function extractKeywords(item) {
  const base = [];

  if (item.category) base.push(item.category);

  if (item.alt) {
    base.push(
      ...item.alt
        .toLowerCase()
        .split(/\s+/)
        .slice(0, 10)
    );
  }

  if (item.title) {
    base.push(
      ...item.title.toLowerCase().split(/\s+/)
    );
  }

  if (Array.isArray(item.keywords)) {
    base.push(...item.keywords.map(k => k.toLowerCase()));
  }

  // remove stop words + duplicates
  const cleaned = [];
  const seen = new Set();

  for (const word of base) {
    if (!word) continue;
    if (STOP_WORDS.has(word)) continue;
    if (seen.has(word)) continue;

    seen.add(word);
    cleaned.push(word);
  }

  return cleaned;
}

// -----------------------------
// BUILD CLEAN FILENAME
// -----------------------------
function buildDownloadFilename(item, index) {
  const category = slugify(item.category || "background");

  const keywords = extractKeywords(item);

  // pick only strongest tokens (avoid repetition spam)
  const core = keywords
    .filter(k => k.length > 2)
    .slice(0, 6)
    .map(slugify)
    .filter(Boolean);

  let base = `${category}`;

  if (core.length) {
    base += "-" + core.join("-");
  }

  // ensure uniqueness
  const suffix = String(index + 1).padStart(3, "0");

  return `${base}-${suffix}.webp`;
}

// -----------------------------
// MAIN
// -----------------------------
function main() {
  const raw = fs.readFileSync(INPUT_FILE, "utf-8");
  const products = JSON.parse(raw);

  const outputRows = [];

  products.forEach((item, i) => {
    const cleanFilename = buildDownloadFilename(item, i);

    outputRows.push({
      ...item,
      cleanFilename
    });
  });

  // convert to CSV (simple)
  const header = Object.keys(outputRows[0]).join(",");

  const csv = [
    header,
    ...outputRows.map(row =>
      Object.values(row)
        .map(v => {
          if (Array.isArray(v)) return `"${v.join(" ")}"`;
          return `"${String(v ?? "").replace(/"/g, '""')}"`;
        })
        .join(",")
    )
  ].join("\n");

  fs.writeFileSync(OUTPUT_FILE, csv);

  console.log("✅ Done!");
  console.log(`📦 Products: ${products.length}`);
  console.log(`📄 File saved to: ${OUTPUT_FILE}`);
}

main();