import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { analyseTasks } from '../js/analysis.js';
import { parseTaskCsv, tasksToCsv } from '../js/csv.js';
import { importCsvTransaction } from '../js/import-workflow.js';
import { SafeBrowserStorage } from '../js/storage.js';

const sampleUrl = new URL('../../data/sample_tasks.csv', import.meta.url);
const sampleCsv = await readFile(sampleUrl, 'utf8');
const parsedSample = parseTaskCsv(sampleCsv);
const sampleTasks = parsedSample.tasks;
const reportingDate = '2026-11-07';
const originalState = { tasks: sampleTasks.slice(0, 1), reportingDate };

function csv(rows) {
  return [
    'task_id,task_name,owner_id,due_date,status,priority',
    ...rows,
  ].join('\n');
}

test('initial seven-record dataset is valid and preserves all task IDs', () => {
  assert.deepEqual(parsedSample.errors, []);
  assert.equal(sampleTasks.length, 7);
  assert.deepEqual(sampleTasks.map((task) => task.id), ['T-101', 'T-102', 'T-103', 'T-104', 'T-105', 'T-106', 'T-107']);
});

test('acceptance KPIs include a two-decimal 28.57 percent completion rate', () => {
  const analysis = analyseTasks(sampleTasks, reportingDate);
  assert.equal(analysis.kpis.total, 7);
  assert.equal(analysis.kpis.completed, 2);
  assert.equal(analysis.kpis.completionRate.toFixed(2), '28.57');
});

test('overdue calculation identifies only T-101 for the acceptance dataset', () => {
  const analysis = analyseTasks(sampleTasks, reportingDate);
  assert.deepEqual(analysis.exceptions.overdue.map((task) => task.id), ['T-101']);
  assert.equal(analysis.kpis.overdue, 1);
});

test('completed tasks are always excluded from overdue tasks', () => {
  const analysis = analyseTasks(sampleTasks, reportingDate);
  assert.ok(!analysis.exceptions.overdue.some((task) => task.id === 'T-107'));
});

test('a task due on the reporting date is not overdue', () => {
  const analysis = analyseTasks(sampleTasks, reportingDate);
  assert.ok(!analysis.exceptions.overdue.some((task) => task.id === 'T-106'));
});

test('missing due dates are tracked separately', () => {
  const analysis = analyseTasks(sampleTasks, reportingDate);
  assert.deepEqual(analysis.exceptions.missingDueDate.map((task) => task.id), ['T-105']);
  assert.equal(analysis.kpis.missingDueDate, 1);
});

test('blocked tasks are tracked separately', () => {
  const analysis = analyseTasks(sampleTasks, reportingDate);
  assert.deepEqual(analysis.exceptions.blocked.map((task) => task.id), ['T-104']);
  assert.equal(analysis.kpis.blocked, 1);
});

test('CSV import rejects duplicate task IDs without accepting a partial dataset', () => {
  const result = parseTaskCsv(csv([
    'T-1,First task,OP-1,2026-11-06,In Progress,High',
    'T-1,Second task,OP-2,2026-11-07,Completed,Low',
  ]));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('duplicate Task ID')));
});

test('CSV import rejects invalid calendar dates', () => {
  const result = parseTaskCsv(csv(['T-1,Date test,OP-1,2026-02-30,In Progress,Medium']));
  assert.equal(result.tasks.length, 0);
  assert.ok(result.errors.some((error) => error.includes('Due Date must be a real date')));
});

test('CSV import reports malformed quoted input', () => {
  const result = parseTaskCsv('task_id,task_name,owner_id,due_date,status,priority\nT-1,"Unclosed task,OP-1,2026-11-06,In Progress,Medium');
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /Unclosed quoted field/);
});

test('CSV import rejects files missing required columns', () => {
  const result = parseTaskCsv('task_id,task_name,owner_id,due_date,status\nT-1,Task,OP-1,2026-11-06,In Progress');
  assert.equal(result.tasks.length, 0);
  assert.ok(result.errors.includes('Missing required CSV column “priority”.'));
});

test('CSV import rejects invalid statuses and priorities', () => {
  const result = parseTaskCsv(csv(['T-1,Invalid values,OP-1,2026-11-06,Waiting,Urgent']));
  assert.equal(result.tasks.length, 0);
  assert.ok(result.errors.some((error) => error.includes('Status “Waiting” is invalid')));
  assert.ok(result.errors.some((error) => error.includes('Priority “Urgent” is invalid')));
});

test('CSV import transaction saves a valid seven-record import before returning dashboard state', () => {
  let persistedState = null;
  const result = importCsvTransaction({
    csvText: sampleCsv,
    currentState: originalState,
    confirmReplace: ({ currentCount, importedCount }) => currentCount === 1 && importedCount === 7,
    persist: (nextState) => {
      persistedState = nextState;
      return { available: true };
    },
  });
  assert.equal(result.status, 'imported');
  assert.equal(result.importedCount, 7);
  assert.equal(persistedState.tasks.length, 7);
  assert.deepEqual(result.nextState, persistedState);
  assert.equal(originalState.tasks.length, 1);
});

test('CSV import transaction rejects invalid input without confirmation, persistence, or state changes', () => {
  let confirmationCalls = 0;
  let persistenceCalls = 0;
  const result = importCsvTransaction({
    csvText: csv(['T-1,Bad task,OP-1,not-a-date,In Progress,High']),
    currentState: originalState,
    confirmReplace: () => {
      confirmationCalls += 1;
      return true;
    },
    persist: () => {
      persistenceCalls += 1;
      return { available: true };
    },
  });
  assert.equal(result.status, 'invalid');
  assert.equal(confirmationCalls, 0);
  assert.equal(persistenceCalls, 0);
  assert.equal(originalState.tasks.length, 1);
});

test('CSV import transaction cancellation leaves existing data untouched and does not persist', () => {
  let persistenceCalls = 0;
  const result = importCsvTransaction({
    csvText: sampleCsv,
    currentState: originalState,
    confirmReplace: () => false,
    persist: () => {
      persistenceCalls += 1;
      return { available: true };
    },
  });
  assert.equal(result.status, 'cancelled');
  assert.equal(persistenceCalls, 0);
  assert.equal(originalState.tasks.length, 1);
});

test('CSV import transaction reports storage failure and does not return replacement state', () => {
  const result = importCsvTransaction({
    csvText: sampleCsv,
    currentState: originalState,
    confirmReplace: () => true,
    persist: () => ({ available: false, error: 'Quota exceeded' }),
  });
  assert.equal(result.status, 'storage-error');
  assert.match(result.error, /Quota exceeded/);
  assert.equal('nextState' in result, false);
  assert.equal(originalState.tasks.length, 1);
});

test('an empty dataset reports zero KPIs and a non-fabricated monitoring recommendation', () => {
  const analysis = analyseTasks([], reportingDate);
  assert.deepEqual(analysis.kpis, {
    total: 0,
    completed: 0,
    completionRate: 0,
    overdue: 0,
    blocked: 0,
    missingDueDate: 0,
  });
  assert.match(analysis.recommendations[0].fact, /no overdue, blocked, missing-date/i);
});

test('recommendations identify only recorded task facts and task owners', () => {
  const analysis = analyseTasks(sampleTasks, reportingDate);
  assert.match(analysis.recommendations[0].fact, /T-101/);
  assert.match(analysis.recommendations[0].fact, /OP-01/);
  assert.match(analysis.recommendations[0].assumption, /^Assumption:/);
  assert.match(analysis.recommendations[0].action, /^Recommended action:/);
});

test('unavailable browser storage degrades without throwing', () => {
  const unavailable = new SafeBrowserStorage(null);
  assert.equal(unavailable.load().available, false);
  assert.equal(unavailable.save({ tasks: [], reportingDate }).available, false);
});

test('CSV exports round-trip through the same validated schema', () => {
  const result = parseTaskCsv(tasksToCsv(sampleTasks));
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.tasks, sampleTasks);
});
