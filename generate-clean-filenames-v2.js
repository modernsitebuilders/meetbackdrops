const fs = require("fs");
const path = require("path");

const INPUT_FILE = "./public/data/image-metadata-complete.json";
const OUTPUT_FILE = "./products_with_clean_filenames.json";

// words that MUST NEVER influence filenames
const GLOBAL_TAGS = new Set([
  "virtual background",
  "zoom background",
  "video call",
  "streaming"
]);

// words too generic for filenames
const STOP_WORDS = new Set([
  "professional",
  "background",
  "image",
  "scene",
  "high quality"
]);

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// extract meaningful words from ALT text
function extractVisualFromAlt(alt) {
  if (!alt) return [];

  return alt
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(word => word.length > 2)
    .filter(word => !STOP_WORDS.has(word));
}

// clean keyword list
function extractVisualKeywords(keywords = []) {
  return keywords.filter(k => {
    const lower = k.toLowerCase();
    return !GLOBAL_TAGS.has(lower);
  });
}

// smart merge + dedupe
function mergeTokens(...arrays) {
  const seen = new Set();
  const result = [];

  arrays.flat().forEach(word => {
    const clean = slugify(word);
    if (!clean) return;
    if (seen.has(clean)) return;

    seen.add(clean);
    result.push(clean);
  });

  return result;
}

// enforce readable filename limit
function limitFilename(tokens, max = 8) {
  return tokens.slice(0, max);
}

function buildFilename(item) {
  const category = slugify(item.category || "");

  const visualKeywords = extractVisualKeywords(item.keywords || []);
  const altWords = extractVisualFromAlt(item.alt || "");

  let tokens = mergeTokens(
    [category],
    visualKeywords,
    altWords
  );

  tokens = limitFilename(tokens);

  // ensure category appears ONCE and not repeated inside keywords
  const filtered = [];
  const seen = new Set();

  for (const t of tokens) {
    if (seen.has(t)) continue;
    seen.add(t);
    filtered.push(t);
  }

  return filtered.join("-") + ".webp";
}

function run() {
  const raw = fs.readFileSync(INPUT_FILE, "utf-8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error("Expected JSON array at root of file");
  }

  const output = data.map(item => {
    const cleanFilename = buildFilename(item);

    return {
      ...item,
      cleanFilename
    };
  });

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(output, null, 2)
  );

  console.log("✅ Done!");
  console.log("📦 Images:", output.length);
  console.log("📄 Output:", OUTPUT_FILE);
}

run();