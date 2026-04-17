function buildFilename(item, index) {
  const category = (item.category || "image").toLowerCase();

  const alt = (item.alt || "").toLowerCase();

  const keywords = (item.keywords || [])
    .slice(0, 3)
    .join(" ")
    .toLowerCase();

  const base = `${category} ${keywords} ${alt}`;

  let slug = base
    .replace(/zoom background|virtual background|video call|streaming/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .slice(0, 8) // 🔥 HARD LIMIT (critical fix)
    .join("-");

  return `${category}-${slug}-${index}.png`;
}