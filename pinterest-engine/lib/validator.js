const REQUIRED_COLUMNS = ['Title', 'Description', 'Image', 'Link', 'Board'];

function hasForbiddenChar(value) {
  if (typeof value !== 'string') return true;
  if (/[\r\n]/.test(value)) return true;
  if (/\u0000/.test(value)) return true;
  return false;
}

function validateRow(row, idx) {
  const errors = [];
  if (!row || typeof row !== 'object') {
    errors.push(`row ${idx} is not an object`);
    return errors;
  }
  const keys = Object.keys(row);
  if (keys.length !== REQUIRED_COLUMNS.length) {
    errors.push(`row ${idx} has ${keys.length} columns, expected ${REQUIRED_COLUMNS.length}`);
  }
  REQUIRED_COLUMNS.forEach((c) => {
    if (!(c in row)) errors.push(`row ${idx} missing column ${c}`);
    const v = row[c];
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      errors.push(`row ${idx} empty column ${c}`);
    }
    if (typeof v === 'string' && hasForbiddenChar(v)) {
      errors.push(`row ${idx} invalid chars in column ${c}`);
    }
  });
  return errors;
}

function validateRows(rows) {
  if (!Array.isArray(rows)) throw new Error('rows must be an array');
  const errors = [];
  rows.forEach((row, i) => {
    const e = validateRow(row, i);
    if (e.length) errors.push(...e);
  });
  if (errors.length) {
    const preview = errors.slice(0, 10).join('\n');
    throw new Error(`CSV validation failed (${errors.length} errors):\n${preview}`);
  }
}

module.exports = { validateRows, REQUIRED_COLUMNS };
