const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = ['slug', 'category', 'folder', 'image_webp'];

function readManifest(manifestPath) {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('Manifest must be a JSON array');
  }
  return data;
}

function validateItem(item, idx) {
  const errors = [];
  for (const f of REQUIRED_FIELDS) {
    if (!item[f] || typeof item[f] !== 'string') {
      errors.push(`item[${idx}] missing field: ${f}`);
    }
  }
  if (item.tags && !Array.isArray(item.tags)) {
    errors.push(`item[${idx}] tags must be array`);
  }
  return errors;
}

function parseManifest(manifestPath) {
  const items = readManifest(manifestPath);
  const allErrors = [];
  items.forEach((it, i) => {
    const errs = validateItem(it, i);
    if (errs.length) allErrors.push(...errs);
  });
  if (allErrors.length) {
    const preview = allErrors.slice(0, 10).join('\n');
    throw new Error(`Manifest validation failed (${allErrors.length} errors):\n${preview}`);
  }
  const sorted = items.slice().sort((a, b) => a.slug.localeCompare(b.slug));
  return sorted;
}

module.exports = { parseManifest };
