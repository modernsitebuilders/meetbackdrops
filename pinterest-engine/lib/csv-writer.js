const fs = require('fs');
const path = require('path');
const { validateRows, REQUIRED_COLUMNS } = require('./validator');

const CDN_BASE_URL = 'https://assets.streambackdrops.com/webp';
const PLACEHOLDER_IMAGE = 'https://assets.streambackdrops.com/placeholder.webp';

function escapeField(value) {
  const str = value == null ? '' : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '';
}

function resolveImageUrl(pin) {
  if (!pin || typeof pin !== 'object') return PLACEHOLDER_IMAGE;
  if (isNonEmptyString(pin.folder) && isNonEmptyString(pin.image_webp)) {
    return `${CDN_BASE_URL}/${pin.folder}/${pin.image_webp}`;
  }
  if (isNonEmptyString(pin.image_webp)) {
    return `${CDN_BASE_URL}/${pin.image_webp}`;
  }
  if (isNonEmptyString(pin.imageUrl)) {
    return pin.imageUrl;
  }
  return PLACEHOLDER_IMAGE;
}

function validateImageColumn(rows) {
  const offending = [];
  for (let i = 0; i < rows.length; i++) {
    const img = rows[i] && rows[i].Image;
    if (!isNonEmptyString(img)) {
      offending.push({ index: i, row: rows[i] });
      if (offending.length >= 5) break;
    }
  }
  if (offending.length > 0) {
    const preview = offending
      .map((o) => `  row ${o.index}: ${JSON.stringify(o.row)}`)
      .join('\n');
    throw new Error(
      `CSV image validation failed (${offending.length}+ rows with empty Image):\n${preview}`
    );
  }
}

function toCsv(rows) {
  validateImageColumn(rows);
  validateRows(rows);
  const header = REQUIRED_COLUMNS.map(escapeField).join(',');
  const body = rows
    .map((row) => REQUIRED_COLUMNS.map((col) => escapeField(row[col])).join(','))
    .join('\n');
  return header + '\n' + body + '\n';
}

function writeCsv(filePath, rows) {
  const csv = toCsv(rows);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, csv, { encoding: 'utf8' });
  return { path: filePath, rowCount: rows.length, bytes: Buffer.byteLength(csv, 'utf8') };
}

function pinToRow(pin, titleField) {
  const image = resolveImageUrl(pin);
  return {
    Title: pin[titleField],
    Description: pin.description,
    Image: isNonEmptyString(image) ? image : PLACEHOLDER_IMAGE,
    Link: pin.link,
    Board: pin.board,
  };
}

module.exports = {
  writeCsv,
  pinToRow,
  toCsv,
  resolveImageUrl,
  validateImageColumn,
  CDN_BASE_URL,
  PLACEHOLDER_IMAGE,
};
