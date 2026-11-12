import { analyseTasks } from './analysis.js';
import { parseTaskCsv, tasksToCsv } from './csv.js';
import { DEFAULT_REPORTING_DATE, DISPLAY_COLUMNS } from './constants.js';
import { clear, element, renderMessages, renderTable } from './dom.js';
import { importCsvTransaction } from './import-workflow.js';
import { SAMPLE_TASKS_CSV } from './sample-data.js';
import { SafeBrowserStorage } from './storage.js';
import { isValidIsoDate, validateTask } from './task-schema.js';

const taskColumns = DISPLAY_COLUMNS.map((column) => ({
  ...column,
  value: (task) => (column.key === 'owner' ? task.owner || 'Unassigned' : task[column.key]),
}));

const exceptionSections = [
  ['exception-overdue', 'Overdue assignments', 'overdue', 'No overdue assignments.'],
  ['exception-blocked', 'Blocked tasks', 'blocked', 'No blocked tasks.'],
  ['exception-missing-date', 'Missing due dates', 'missingDueDate', 'No tasks with a missing due date.'],
  ['exception-high-priority', 'High-priority exceptions', 'highPriority', 'No active high-priority exceptions.'],
];

const state = { tasks: [], reportingDate: DEFAULT_REPORTING_DATE };
const storage = new SafeBrowserStorage();

function byId(id) {
  return document.getElementById(id);
}

function setNotice(message, kind = 'info') {
  const notice = byId('app-notice');
  notice.textContent = message;
  notice.className = `notice notice-${kind}`;
}

function saveState() {
  const result = storage.save({ tasks: state.tasks, reportingDate: state.reportingDate });
  if (!result.available) {
    setNotice('Browser storage is unavailable. Your current session works, but changes will not persist after closing the page.', 'warning');
  }
  return result;
}

function validateSavedState(candidate) {
  if (!candidate || !Array.isArray(candidate.tasks) || !isValidIsoDate(candidate.reportingDate)) return null;
  const knownIds = new Set();
  const tasks = [];
  for (const rawTask of candidate.tasks) {
    const validation = validateTask(rawTask, knownIds, 'Saved task');
    if (!validation.valid) return null;
    knownIds.add(validation.task.id);
    tasks.push(validation.task);
  }
  return { tasks, reportingDate: candidate.reportingDate };
}

async function getSampleTasks() {
  try {
    const sampleUrl = new URL('../../data/sample_tasks.csv', import.meta.url);
    const response = await fetch(sampleUrl);
    if (!response.ok) throw new Error(`Sample CSV request returned ${response.status}.`);
    const parsed = parseTaskCsv(await response.text());
    if (parsed.errors.length > 0) throw new Error(parsed.errors.join(' '));
    return { tasks: parsed.tasks, source: 'data/sample_tasks.csv' };
  } catch (error) {
    const parsed = parseTaskCsv(SAMPLE_TASKS_CSV);
    if (parsed.errors.length > 0) throw new Error(parsed.errors.join(' '));
    return {
      tasks: parsed.tasks,
      source: 'the built-in copy of data/sample_tasks.csv (direct file launch prevented loading the source file)',
    };
  }
}

function renderKpis(analysis) {
  const values = {
    'kpi-total': analysis.kpis.total,
    'kpi-completed': analysis.kpis.completed,
    'kpi-completion-rate': `${analysis.kpis.completionRate.toFixed(2)}%`,
    'kpi-overdue': analysis.kpis.overdue,
    'kpi-blocked': analysis.kpis.blocked,
    'kpi-missing-due-date': analysis.kpis.missingDueDate,
  };
  Object.entries(values).forEach(([id, value]) => {
    byId(id).textContent = String(value);
  });
}

function renderRecommendations(recommendations) {
  const target = byId('recommendations');
  clear(target);
  recommendations.forEach((recommendation) => {
    const card = element('article', { className: 'recommendation-card' });
    card.append(element('p', { className: 'recommendation-fact', text: recommendation.fact }));
    card.append(element('p', { className: 'recommendation-assumption', text: recommendation.assumption }));
    card.append(element('p', { className: 'recommendation-action', text: recommendation.action }));
    target.append(card);
  });
}

function render() {
  const analysis = analyseTasks(state.tasks, state.reportingDate);
  byId('reporting-date').value = state.reportingDate;
  byId('task-count-label').textContent = `${state.tasks.length} task${state.tasks.length === 1 ? '' : 's'} in current dataset`;
  renderKpis(analysis);
  renderTable(byId('all-tasks'), taskColumns, state.tasks, 'No tasks are currently loaded.');
  exceptionSections.forEach(([id, , key, emptyMessage]) => {
    renderTable(byId(id), taskColumns, analysis.exceptions[key], emptyMessage);
  });
  renderTable(byId('workload-table'), [
    { label: 'Owner', key: 'owner' },
    { label: 'Total assignments', key: 'total' },
    { label: 'Completed', key: 'completed' },
    { label: 'In progress', key: 'inProgress' },
    { label: 'Blocked', key: 'blocked' },
    { label: 'Not started', key: 'notStarted' },
  ], analysis.workload, 'No workload data is available.');
  renderRecommendations(analysis.recommendations);
  return analysis;
}

function showValidationErrors(errors) {
  renderMessages(byId('validation-errors'), errors, 'message-list message-error');
}

function clearValidationErrors() {
  clear(byId('validation-errors'));
}

function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function taskLine(task) {
  return `${task.id} | ${task.name} | Owner: ${task.owner || 'Unassigned'} | Due: ${task.dueDate || 'Missing'} | ${task.status} | ${task.priority}`;
}

function buildExceptionReport(analysis) {
  const lines = [
    'OPERATIONS MONITOR V1.0 — EXCEPTION REPORT',
    `Reporting date: ${analysis.reportingDate}`,
    `Generated locally: ${new Date().toLocaleString()}`,
    '',
    'KPI SUMMARY',
    `Total tasks: ${analysis.kpis.total}`,
    `Completed tasks: ${analysis.kpis.completed}`,
    `Completion rate: ${analysis.kpis.completionRate.toFixed(2)}%`,
    `Overdue tasks: ${analysis.kpis.overdue}`,
    `Blocked tasks: ${analysis.kpis.blocked}`,
    `Missing due dates: ${analysis.kpis.missingDueDate}`,
  ];
  const reportGroups = [
    ['OVERDUE ASSIGNMENTS', analysis.exceptions.overdue],
    ['BLOCKED TASKS', analysis.exceptions.blocked],
    ['MISSING DUE DATES', analysis.exceptions.missingDueDate],
    ['HIGH-PRIORITY EXCEPTIONS', analysis.exceptions.highPriority],
  ];
  reportGroups.forEach(([title, tasks]) => {
    lines.push('', title);
    if (tasks.length === 0) lines.push('None.');
    else tasks.forEach((task) => lines.push(taskLine(task)));
  });
  lines.push('', 'SUPERVISORY RECOMMENDATIONS');
  analysis.recommendations.forEach((recommendation, index) => {
    lines.push(`${index + 1}. ${recommendation.fact}`);
    lines.push(`   ${recommendation.assumption}`);
    lines.push(`   ${recommendation.action}`);
  });
  return `${lines.join('\r\n')}\r\n`;
}

function attachHandlers() {
  byId('task-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const validation = validateTask(Object.fromEntries(form.entries()), new Set(state.tasks.map((task) => task.id)), 'New task');
    if (!validation.valid) {
      showValidationErrors(validation.errors);
      setNotice('The task was not added. Review the validation messages.', 'error');
      return;
    }
    state.tasks.push(validation.task);
    clearValidationErrors();
    event.currentTarget.reset();
    saveState();
    render();
    setNotice(`Added task ${validation.task.id}.`, 'success');
  });

  byId('reporting-date').addEventListener('change', (event) => {
    const date = event.currentTarget.value;
    if (!isValidIsoDate(date)) {
      event.currentTarget.value = state.reportingDate;
      setNotice('Reporting date must be a real date in YYYY-MM-DD format.', 'error');
      return;
    }
    state.reportingDate = date;
    saveState();
    render();
    setNotice(`Reporting date changed to ${date}.`, 'success');
  });

  byId('csv-upload').addEventListener('change', async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const fileName = file.name || 'selected CSV file';
    try {
      const outcome = importCsvTransaction({
        csvText: await file.text(),
        currentState: state,
        confirmReplace: ({ currentCount, importedCount }) => window.confirm(
          `Replace the current ${currentCount} task record(s) with ${importedCount} imported record(s)?`,
        ),
        persist: (nextState) => storage.save(nextState),
      });

      if (outcome.status === 'invalid') {
        showValidationErrors(outcome.errors);
        setNotice(`Import failed: ${outcome.errors.length} parsing or validation issue${outcome.errors.length === 1 ? '' : 's'} found. Current task data was left unchanged.`, 'error');
        return;
      }
      if (outcome.status === 'cancelled') {
        clearValidationErrors();
        setNotice('Import cancelled. Current task data was left unchanged.', 'info');
        return;
      }
      if (outcome.status === 'storage-error' || outcome.status === 'confirmation-error') {
        setNotice(`Import failed: ${outcome.error} Current task data was left unchanged.`, 'error');
        return;
      }

      state.tasks = outcome.nextState.tasks;
      state.reportingDate = outcome.nextState.reportingDate;
      clearValidationErrors();
      render();
      setNotice(`Import successful: ${outcome.importedCount} task record${outcome.importedCount === 1 ? '' : 's'} imported from ${fileName}.`, 'success');
    } catch (error) {
      showValidationErrors([`The selected file could not be read: ${error.message}`]);
      setNotice('Import failed because the selected file could not be read. Current task data was left unchanged.', 'error');
    } finally {
      // Reset on success, validation failure, cancellation, and storage/read errors.
      input.value = '';
    }
  });

  byId('export-csv').addEventListener('click', () => {
    download('operations-monitor-tasks.csv', tasksToCsv(state.tasks), 'text/csv;charset=utf-8');
    setNotice('Task CSV export started.', 'success');
  });

  byId('export-report').addEventListener('click', () => {
    const analysis = analyseTasks(state.tasks, state.reportingDate);
    download(`operations-monitor-exception-report-${state.reportingDate}.txt`, buildExceptionReport(analysis), 'text/plain;charset=utf-8');
    setNotice('Exception report download started.', 'success');
  });

  byId('clear-tasks').addEventListener('click', () => {
    if (!window.confirm('Clear all current task records? This change will replace your saved browser data.')) return;
    state.tasks = [];
    clearValidationErrors();
    saveState();
    render();
    setNotice('All task records were cleared. You can reset to sample data at any time.', 'warning');
  });

  byId('reset-sample').addEventListener('click', async () => {
    if (!window.confirm('Replace all current task records and reset the reporting date to the sample dataset defaults?')) return;
    try {
      const sample = await getSampleTasks();
      state.tasks = sample.tasks;
      state.reportingDate = DEFAULT_REPORTING_DATE;
      clearValidationErrors();
      saveState();
      render();
      setNotice(`Reset to ${sample.tasks.length} sample records loaded from ${sample.source}.`, 'success');
    } catch (error) {
      setNotice(`Sample data could not be loaded: ${error.message}`, 'error');
    }
  });
}

async function initialise() {
  attachHandlers();
  const saved = storage.load();
  const restored = saved.available ? validateSavedState(saved.value) : null;
  if (restored) {
    state.tasks = restored.tasks;
    state.reportingDate = restored.reportingDate;
    render();
    setNotice(`Restored ${state.tasks.length} task record(s) from browser storage.`, 'info');
    return;
  }
  try {
    const sample = await getSampleTasks();
    state.tasks = sample.tasks;
    state.reportingDate = DEFAULT_REPORTING_DATE;
    saveState();
    render();
    const savedWarning = saved.error ? ' Saved browser data was unavailable or invalid, so it was not used.' : '';
    setNotice(`Loaded ${sample.tasks.length} sample records from ${sample.source}.${savedWarning}`, saved.available ? 'success' : 'warning');
  } catch (error) {
    render();
    setNotice(`The application loaded, but sample data could not be read: ${error.message}`, 'error');
  }
}

initialise();
