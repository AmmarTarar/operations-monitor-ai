export const CSV_COLUMNS = [
  'task_id',
  'task_name',
  'owner_id',
  'due_date',
  'status',
  'priority',
];

export const TASK_STATUSES = ['Not Started', 'In Progress', 'Blocked', 'Completed'];
export const TASK_PRIORITIES = ['High', 'Medium', 'Low'];
export const DEFAULT_REPORTING_DATE = '2026-11-07';
export const STORAGE_KEY = 'operations-monitor-v1-state';

export const DISPLAY_COLUMNS = [
  { label: 'Task ID', key: 'id' },
  { label: 'Task name', key: 'name' },
  { label: 'Owner', key: 'owner' },
  { label: 'Due date', key: 'dueDate' },
  { label: 'Status', key: 'status' },
  { label: 'Priority', key: 'priority' },
];
