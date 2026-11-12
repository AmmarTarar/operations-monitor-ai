import { TASK_PRIORITIES, TASK_STATUSES } from './constants.js';

function clean(value) {
  return String(value ?? '').trim();
}

export function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export function validateTask(rawTask, knownIds = new Set(), label = 'Task') {
  const task = {
    id: clean(rawTask.task_id ?? rawTask.id),
    name: clean(rawTask.task_name ?? rawTask.name),
    owner: clean(rawTask.owner_id ?? rawTask.owner),
    dueDate: clean(rawTask.due_date ?? rawTask.dueDate),
    status: clean(rawTask.status),
    priority: clean(rawTask.priority),
  };
  const errors = [];

  if (!task.id) errors.push(`${label}: Task ID is required.`);
  else if (knownIds.has(task.id)) errors.push(`${label}: duplicate Task ID “${task.id}”.`);
  if (!task.name) errors.push(`${label}: Task Name is required.`);
  if (task.dueDate && !isValidIsoDate(task.dueDate)) {
    errors.push(`${label}: Due Date must be a real date in YYYY-MM-DD format, or blank.`);
  }
  if (!task.status) errors.push(`${label}: Status is required.`);
  else if (!TASK_STATUSES.includes(task.status)) {
    errors.push(`${label}: Status “${task.status}” is invalid. Use ${TASK_STATUSES.join(', ')}.`);
  }
  if (!task.priority) errors.push(`${label}: Priority is required.`);
  else if (!TASK_PRIORITIES.includes(task.priority)) {
    errors.push(`${label}: Priority “${task.priority}” is invalid. Use ${TASK_PRIORITIES.join(', ')}.`);
  }

  return { task, errors, valid: errors.length === 0 };
}

export function taskToCsvRecord(task) {
  return {
    task_id: task.id,
    task_name: task.name,
    owner_id: task.owner,
    due_date: task.dueDate,
    status: task.status,
    priority: task.priority,
  };
}
