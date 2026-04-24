const CATEGORY_PREFIX_MAP = [
  { prefix: 'bookshelves', board: 'Bookshelves' },
  { prefix: 'wall-shelves', board: 'Bookshelves' },
  { prefix: 'office-spaces', board: 'Office Spaces' },
  { prefix: 'home-offices', board: 'Office Spaces' },
  { prefix: 'minimalist-offices', board: 'Office Spaces' },
  { prefix: 'executive-offices', board: 'Office Spaces' },
  { prefix: 'nature', board: 'Nature Landscapes' },
  { prefix: 'beach', board: 'Nature Landscapes' },
  { prefix: 'mountain', board: 'Nature Landscapes' },
];

const TAG_OVERRIDES = [
  { match: ['office', 'meeting'], board: 'Office Spaces' },
  { match: ['nature', 'landscape'], board: 'Nature Landscapes' },
];

const FALLBACK_BOARD = 'Virtual Backgrounds';

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map((t) => (typeof t === 'string' ? t.toLowerCase() : '')).filter(Boolean);
}

function assignBoard(pin) {
  let board = FALLBACK_BOARD;
  const category = (pin.category || '').toLowerCase();
  for (const rule of CATEGORY_PREFIX_MAP) {
    if (category.startsWith(rule.prefix)) {
      board = rule.board;
      break;
    }
  }
  const tags = normalizeTags(pin.tags);
  for (const override of TAG_OVERRIDES) {
    if (override.match.some((m) => tags.includes(m))) {
      board = override.board;
      break;
    }
  }
  return board;
}

function assignBoards(pins) {
  return pins.map((p) => ({ ...p, board: assignBoard(p) }));
}

module.exports = { assignBoards, assignBoard };
