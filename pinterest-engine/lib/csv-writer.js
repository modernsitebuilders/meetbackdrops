const fs = require('fs');
const path = require('path');
const { validateRows, REQUIRED_COLUMNS } = require('./validator');

function escapeField(value) {
  const str = value == null ? '' : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
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
  return {
    Title: pin[titleField],
    Description: pin.description,
    Image: pin.imageUrl,
    Link: pin.link,
    Board: pin.board,
  };
}

module.exports = { writeCsv, pinToRow, toCsv };
