import { CSV_COLUMNS } from './constants.js';
import { taskToCsvRecord, validateTask } from './task-schema.js';

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0) throw new Error('Unexpected quote in an unquoted CSV field.');
      inQuotes = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (inQuotes) throw new Error('Unclosed quoted field in CSV input.');
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function isBlankRow(row) {
  return row.every((value) => value.trim() === '');
}

export function parseTaskCsv(text) {
  let rows;
  try {
    rows = parseCsv(String(text ?? ''));
  } catch (error) {
    return { tasks: [], errors: [`CSV could not be read: ${error.message}`], valid: false };
  }
  rows = rows.filter((row) => !isBlankRow(row));
  if (rows.length === 0) {
    return { tasks: [], errors: ['CSV must contain a header row with all six required columns.'], valid: false };
  }

  const headers = rows[0].map((header, index) => {
    const value = header.trim().toLowerCase();
    return index === 0 ? value.replace(/^\uFEFF/, '') : value;
  });
  const headerProblems = [];
  const seenHeaders = new Set();
  headers.forEach((header) => {
    if (seenHeaders.has(header)) headerProblems.push(`CSV header “${header}” appears more than once.`);
    seenHeaders.add(header);
  });
  const columnIndexes = new Map(headers.map((header, index) => [header, index]));
  CSV_COLUMNS.forEach((column) => {
    if (!columnIndexes.has(column)) headerProblems.push(`Missing required CSV column “${column}”.`);
  });
  if (headerProblems.length > 0) return { tasks: [], errors: headerProblems, valid: false };

  const tasks = [];
  const errors = [];
  const knownIds = new Set();
  rows.slice(1).forEach((row, position) => {
    const rowNumber = position + 2;
    if (row.length !== headers.length) {
      errors.push(`Row ${rowNumber}: expected ${headers.length} columns but found ${row.length}.`);
      return;
    }
    const rawTask = Object.fromEntries(CSV_COLUMNS.map((column) => [column, row[columnIndexes.get(column)]]));
    const validation = validateTask(rawTask, knownIds, `Row ${rowNumber}`);
    if (!validation.valid) {
      errors.push(...validation.errors);
      return;
    }
    knownIds.add(validation.task.id);
    tasks.push(validation.task);
  });
  return { tasks, errors, valid: errors.length === 0 };
}

function escapeCsv(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function tasksToCsv(tasks) {
  const lines = [CSV_COLUMNS.join(',')];
  tasks.forEach((task) => {
    const record = taskToCsvRecord(task);
    lines.push(CSV_COLUMNS.map((column) => escapeCsv(record[column])).join(','));
  });
  return `${lines.join('\r\n')}\r\n`;
}
