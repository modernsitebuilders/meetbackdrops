const fs = require('fs');

function deepFreeze(value) {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return value;
}

function invalidError(reason, extra) {
  const parts = ['ERROR: QUOTA_INVALID', `reason=${reason}`];
  if (extra) {
    const keys = Object.keys(extra);
    let k = 0;
    while (k < keys.length) {
      parts[parts.length] = `${keys[k]}=${extra[keys[k]]}`;
      k = k + 1;
    }
  }
  return new Error(parts.join(' | '));
}

function loadExecutionTape(quotaTablePath) {
  if (!fs.existsSync(quotaTablePath)) {
    throw invalidError('missing_file', { path: quotaTablePath });
  }
  let raw;
  try {
    raw = fs.readFileSync(quotaTablePath, 'utf8');
  } catch (e) {
    throw invalidError('not_readable', { path: quotaTablePath });
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw invalidError('not_json', { path: quotaTablePath });
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw invalidError('not_object', { path: quotaTablePath });
  }
  if (!Array.isArray(parsed.categories)) {
    throw invalidError('missing_categories_array');
  }
  const categories = parsed.categories;
  const tape = [];
  let categoryCount = 0;
  let v = 0;
  while (v < categories.length) {
    const entry = categories[v];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw invalidError('entry_not_object', { index: v });
    }
    if (typeof entry.category !== 'string' || entry.category.length === 0) {
      throw invalidError('invalid_category_name', { index: v });
    }
    if (!Array.isArray(entry.items)) {
      throw invalidError('missing_items_array', { category: entry.category });
    }
    if (typeof entry.targetCount !== 'number' || !Number.isInteger(entry.targetCount) || entry.targetCount < 1) {
      throw invalidError('invalid_targetCount', { category: entry.category });
    }
    if (entry.items.length < entry.targetCount) {
      throw new Error(
        `ERROR: QUOTA_MISMATCH | category=${entry.category} | required=${entry.targetCount} | available=${entry.items.length}`,
      );
    }
    let k = 0;
    while (k < entry.items.length) {
      const id = entry.items[k];
      if (typeof id !== 'string' || id.length === 0) {
        throw invalidError('invalid_item', { category: entry.category, index: k });
      }
      if (k < entry.targetCount) {
        tape[tape.length] = id;
      }
      k = k + 1;
    }
    categoryCount = categoryCount + 1;
    v = v + 1;
  }
  return deepFreeze({ tape, categoryCount });
}

function executeQuotaTable(tape, pinsBySlug) {
  if (!Array.isArray(tape) || !Object.isFrozen(tape)) {
    throw new Error('ERROR: TAPE_NOT_FROZEN');
  }
  const result = [];
  let i = 0;
  while (i < tape.length) {
    const id = tape[i];
    const pin = pinsBySlug[id];
    if (!pin) {
      throw new Error(`ERROR: PIN_NOT_FOUND | id=${id}`);
    }
    result[result.length] = pin;
    i = i + 1;
  }
  return result;
}

module.exports = {
  loadExecutionTape,
  executeQuotaTable,
};
