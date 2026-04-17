const fs = require("fs");
const path = require("path");

/**
 * =========================
 * CONFIG
 * =========================
 */
const DEFAULT_INPUT = "products.json";
const OUTPUT_FILE = "products_with_clean_filenames.json";

/**
 * =========================
 * SAFE STRING HANDLING
 * (fixes your toLowerCase crash)
 * =========================
 */
function safeString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(" ");
  return String(value);
}

/**
 * =========================
 * SLUGIFY
 * =========================
 */
function slugify(text) {
  return safeString(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

/**
 * =========================
 * TOKEN EXTRACTOR
 * =========================
 */
function extractTokens(item) {
  const raw = [
    item.category,
    item.title,
    item.description,
    item.alt,
    ...(item.keywords || []),
  ];

  const tokens = raw
    .map(safeString)
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);

  return [...new Set(tokens)];
}

/**
 * =========================
 * INTENT ENGINE V3
 * (simple but strong baseline)
 * =========================
 */
function detectIntent(tokens, item) {
  const t = new Set(tokens);

  if (t.has("gallery") || t.has("art") || t.has("museum")) {
    return "gallery-aesthetic";
  }

  if (t.has("bookshelf") || t.has("bookshelves") || t.has("books")) {
    if (t.has("dark") || t.has("moody") || t.has("industrial")) {
      return "dark-industrial-bookshelf-aesthetic";
    }
    if (t.has("bright") || t.has("natural") || t.has("light")) {
      return "bright-bookshelf-aesthetic";
    }
    return "bookshelf-aesthetic";
  }

  if (t.has("coffee") || t.has("cafe")) {
    return "cafe-aesthetic";
  }

  return "general-background";
}

/**
 * =========================
 * CLEAN FILENAME BUILDER
 * =========================
 */
function buildCleanFilename(item, tokens, intent) {
  const base = slugify(item.title || item.filename);
  const category = slugify(item.category);

  const intentSlug = slugify(intent);

  return `${category}-${intentSlug}-${base}.webp`;
}

/**
 * =========================
 * PIPELINE
 * =========================
 */
function run(inputPath) {
  console.log("🚀 Loading:", inputPath);

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`);
    console.error("👉 Available options:");
    console.error("   - products.json");
    console.error("   - products_with_clean_filenames.json");
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf-8");
  const data = JSON.parse(raw);

  const items = Array.isArray(data) ? data : data.items || [];

  const output = items.map((item, index) => {
    const tokens = extractTokens(item);
    const intent = detectIntent(tokens, item);

    const cleanFilename = buildCleanFilename(item, tokens, intent);

    return {
      ...item,
      cleanFilename,
      _tokens: tokens,
      _index: index,
      _intent: intent,
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log("✅ Done!");
  console.log("📦 Output written to:", OUTPUT_FILE);
}

/**
 * =========================
 * CLI ENTRY
 * =========================
 */
const inputFile = process.argv[2] || DEFAULT_INPUT;
run(inputFile);