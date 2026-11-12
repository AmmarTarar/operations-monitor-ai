import { TASK_STATUSES } from './constants.js';
import { isValidIsoDate } from './task-schema.js';

function displayOwner(owner) {
  return owner || 'Unassigned';
}

function makeRecommendation(task, type) {
  const owner = displayOwner(task.owner);
  const detail = `${task.id} (${task.name})`;
  if (type === 'overdue') {
    return {
      fact: `Recorded fact: ${detail} is assigned to ${owner}, was due ${task.dueDate}, and remains ${task.status}.`,
      assumption: 'Assumption: the record does not state why the task is late.',
      action: `Recommended action: ask ${owner} to confirm the blocker or recovery plan and record a revised due date if approved.`,
    };
  }
  if (type === 'blocked') {
    return {
      fact: `Recorded fact: ${detail} is assigned to ${owner} and is marked Blocked.`,
      assumption: 'Assumption: the record does not identify the blocking dependency.',
      action: `Recommended action: ask ${owner} to document the blocker, accountable resolver, and next review point.`,
    };
  }
  if (type === 'missing-date') {
    return {
      fact: `Recorded fact: ${detail} is assigned to ${owner} and has no recorded due date.`,
      assumption: 'Assumption: no deadline can be inferred from the available record.',
      action: `Recommended action: ask ${owner} or the supervisor to set and validate an agreed due date.`,
    };
  }
  return {
    fact: `Recorded fact: ${detail} is assigned to ${owner}, is High priority, and remains ${task.status}.`,
    assumption: 'Assumption: the record does not state its business impact or escalation path.',
    action: `Recommended action: confirm its priority, owner capacity, and whether supervisory escalation is needed.`,
  };
}

export function analyseTasks(tasks, reportingDate) {
  if (!isValidIsoDate(reportingDate)) {
    throw new Error('Reporting date must be a real date in YYYY-MM-DD format.');
  }
  const completedTasks = tasks.filter((task) => task.status === 'Completed');
  const overdueTasks = tasks.filter((task) => task.dueDate
    && task.dueDate < reportingDate
    && task.status !== 'Completed');
  const blockedTasks = tasks.filter((task) => task.status === 'Blocked');
  const missingDateTasks = tasks.filter((task) => !task.dueDate);
  const highPriorityTasks = tasks.filter((task) => task.priority === 'High' && task.status !== 'Completed');

  const workloadMap = new Map();
  tasks.forEach((task) => {
    const owner = displayOwner(task.owner);
    if (!workloadMap.has(owner)) {
      workloadMap.set(owner, {
        owner,
        total: 0,
        completed: 0,
        inProgress: 0,
        blocked: 0,
        notStarted: 0,
      });
    }
    const counts = workloadMap.get(owner);
    counts.total += 1;
    if (task.status === 'Completed') counts.completed += 1;
    if (task.status === 'In Progress') counts.inProgress += 1;
    if (task.status === 'Blocked') counts.blocked += 1;
    if (task.status === 'Not Started') counts.notStarted += 1;
  });

  const recommendations = [];
  const alreadyRecommended = new Set();
  overdueTasks.forEach((task) => {
    recommendations.push(makeRecommendation(task, 'overdue'));
    alreadyRecommended.add(task.id);
  });
  blockedTasks.forEach((task) => {
    recommendations.push(makeRecommendation(task, 'blocked'));
    alreadyRecommended.add(task.id);
  });
  missingDateTasks.forEach((task) => {
    recommendations.push(makeRecommendation(task, 'missing-date'));
    alreadyRecommended.add(task.id);
  });
  highPriorityTasks.filter((task) => !alreadyRecommended.has(task.id)).forEach((task) => {
    recommendations.push(makeRecommendation(task, 'high-priority'));
  });

  const total = tasks.length;
  return {
    reportingDate,
    tasks,
    kpis: {
      total,
      completed: completedTasks.length,
      completionRate: total === 0 ? 0 : (completedTasks.length / total) * 100,
      overdue: overdueTasks.length,
      blocked: blockedTasks.length,
      missingDueDate: missingDateTasks.length,
    },
    exceptions: {
      overdue: overdueTasks,
      blocked: blockedTasks,
      missingDueDate: missingDateTasks,
      highPriority: highPriorityTasks,
    },
    workload: [...workloadMap.values()].sort((first, second) => first.owner.localeCompare(second.owner)),
    recommendations: recommendations.length > 0 ? recommendations : [{
      fact: 'Recorded fact: no overdue, blocked, missing-date, or active high-priority exceptions are present.',
      assumption: 'Assumption: this assessment is limited to the currently recorded tasks.',
      action: 'Recommended action: continue routine monitoring and keep task records current.',
    }],
    validStatuses: TASK_STATUSES,
  };
}
