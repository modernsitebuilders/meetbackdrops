const fs = require("fs");

const data = JSON.parse(
  fs.readFileSync("./public/data/image-metadata-complete.json", "utf-8")
);

// STRICT controlled vocabulary ONLY
const SCENES = {
  cafe: ["cafe", "coffee", "espresso", "barista"],
  workspace: ["workspace", "office", "desk", "communal"],
  bakery: ["bakery", "pastry", "bread"],
  industrial: ["industrial", "loft", "brick", "ceiling"],
  gallery: ["gallery", "art"],
};

const MOODS = {
  cozy: ["cozy", "warm", "soft", "inviting", "traditional"],
  modern: ["modern", "clean", "minimalist", "sleek"],
  rustic: ["rustic", "wood", "vintage"],
  elegant: ["elegant", "french", "luxury", "bright"],
  moody: ["moody", "dark", "dramatic"],
};

const LIGHTS = {
  warm: ["warm", "golden", "amber"],
  bright: ["bright", "white", "sunlit"],
  dark: ["dark", "black", "shadow"],
  soft: ["soft", "diffused", "pastel"],
};

function slug(str = "") {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function matchGroup(text, groups, fallback) {
  for (const key in groups) {
    if (groups[key].some(word => text.includes(word))) {
      return key;
    }
  }
  return fallback;
}

function buildFilename(item, i) {
  const text = `${item.alt || ""} ${(item.keywords || []).join(" ")}`.toLowerCase();

  const category = slug(item.category || "uncategorized");

  const scene = matchGroup(text, SCENES, "cafe");
  const mood = matchGroup(text, MOODS, "modern");
  const light = matchGroup(text, LIGHTS, "warm");

  const id = String(i + 1).padStart(2, "0");

  return `${category}-${scene}-${mood}-${light}-${id}.webp`;
}

let csv = [];

data.forEach((item, i) => {
  const filename = buildFilename(item, i);

  csv.push([
    item.title || "",
    item.title || "",
    item.description || "",
    item.category || "",
    `"${(item.keywords || []).join(", ")}"`,
    filename
  ].join(","));
});

fs.writeFileSync("products_upload.csv", csv.join("\n"));

console.log("✅ DONE");
console.log(`📦 Items: ${data.length}`);