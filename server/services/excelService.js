const XLSX = require('xlsx');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const REQUIRED_FIELDS = ['year', 'state', 'district', 'crop', 'rainfall'];

const NUMERIC_FIELDS = ['year', 'rainfall', 'temperature', 'humidity', 'nitrogen', 'phosphorus', 'potassium', 'ph', 'area', 'production', 'yield'];

function normalizeRow(rawRow) {
  const row = {};
  Object.keys(rawRow).forEach((key) => {
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '');
    row[cleanKey] = typeof rawRow[key] === 'string' ? rawRow[key].trim() : rawRow[key];
  });
  return row;
}

function validateRow(row, index, seenSignatures) {
  const errors = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (row[field] === undefined || row[field] === null || row[field] === '') {
      errors.push(`Missing ${field}`);
    }
  });

  if (row.year && (isNaN(row.year) || row.year < 1900 || row.year > 2100)) {
    errors.push('Invalid Year');
  }

  if (row.rainfall !== undefined && row.rainfall !== '' && isNaN(row.rainfall)) {
    errors.push('Invalid Rainfall');
  }

  NUMERIC_FIELDS.forEach((field) => {
    if (row[field] !== undefined && row[field] !== '' && isNaN(row[field])) {
      errors.push(`Invalid Numeric Values (${field})`);
    }
  });

  const signature = `${row.year}|${row.district}|${row.crop}|${row.season || ''}`.toLowerCase();
  if (seenSignatures.has(signature)) {
    errors.push('Duplicate Records');
  } else {
    seenSignatures.add(signature);
  }

  return errors;
}

function coerceNumbers(row) {
  const coerced = { ...row };
  NUMERIC_FIELDS.forEach((field) => {
    if (coerced[field] !== undefined && coerced[field] !== '') {
      coerced[field] = Number(coerced[field]);
    }
  });
  return coerced;
}

async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.csv') {
    return parseCSV(filePath);
  }
  return parseExcel(filePath);
}

function parseExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rawRows.map(normalizeRow);
}

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(normalizeRow(data)))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

function validateDataset(rows) {
  const seenSignatures = new Set();
  const validRows = [];
  const invalidRows = [];

  rows.forEach((row, index) => {
    const errors = validateRow(row, index, seenSignatures);
    if (errors.length === 0) {
      validRows.push(coerceNumbers(row));
    } else {
      invalidRows.push({ row: index + 2, data: row, reasons: errors }); // +2 accounts for header row + 1-index
    }
  });

  return {
    totalRows: rows.length,
    validRows,
    invalidRows,
    validCount: validRows.length,
    invalidCount: invalidRows.length
  };
}

module.exports = { parseFile, validateDataset, REQUIRED_FIELDS };
