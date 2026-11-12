
# Operations Monitor V1.0 — Business Requirements

## Business objective and users

Provide Operations Managers, Team Leaders, and Operations Supervisors with a reliable local application to monitor task execution, measure workload and performance, and identify exceptions requiring supervisory action.

## Task data requirements

Every imported CSV must include these six headers: `task_id`, `task_name`, `owner_id`, `due_date`, `status`, and `priority`.

- Task ID and Task Name are required for each record.
- Owner ID may be blank; it is displayed as **Unassigned** for workload reporting.
- Due Date may be blank; it is tracked as a missing-date exception. Nonblank dates must be real `YYYY-MM-DD` values.
- Status must be one of `Not Started`, `In Progress`, `Blocked`, or `Completed`.
- Priority must be one of `High`, `Medium`, or `Low`.
- Task IDs must be unique within the active dataset.

## V1.0 functional requirements

1. Load the canonical sample CSV on first use and let a user import another CSV or add one task manually.
2. Validate CSV structure and every record before replacing task data. Report all found errors and never silently replace data with a partial import.
3. Let the user select the reporting date used by all overdue calculations.
4. Display Total Tasks, Completed Tasks, Completion Rate, Overdue Tasks, Blocked Tasks, and Missing Due Dates.
5. Display all task records and separate exception views for overdue, blocked, missing-date, and active High-priority records.
6. Display owner workload totals with counts for Completed, In Progress, Blocked, and Not Started assignments.
7. Produce a transparent local Operations Review with recorded facts, clearly marked assumptions, and supervisory actions. Recommendations must reference recorded task IDs and owners where present.
8. Persist the task set and reporting date using browser local storage when available.
9. Support task CSV export, downloadable exception reports, confirmed clearing, and confirmed reset to sample data.

## Business rules

- Completed tasks must never count as overdue.
- A task is overdue only when its valid due date is earlier than the reporting date and it is not Completed.
- A task due on the reporting date is not overdue.
- Missing due dates are identified separately and are not treated as overdue.
- Blocked tasks are identified separately.
- High-priority exceptions are High-priority tasks that are not Completed.
- Completion Rate = Completed Tasks / Total Tasks × 100; an empty dataset has a 0.00% completion rate.
- Recommendations may state only recorded task facts. The reason for a delay, impact, or resolution is an assumption unless the record supplies it.

## Non-functional requirements

- Run offline with no paid API, subscription, cloud AI, or external model dependency.
- Use no unnecessary third-party client-side dependency.
- Safely render user-supplied data without HTML injection.
- Preserve data on failed imports and warn clearly when persistent browser storage is unavailable.
- Remain understandable and maintainable through small JavaScript modules and automated tests.

## Acceptance dataset

For `data/sample_tasks.csv` and reporting date `2026-11-07`, V1.0 must show:

| Measure | Expected result |
|---|---:|
| Total tasks | 7 |
| Completed tasks | 2 |
| Completion rate | 28.57% |
| Overdue tasks | 1 — T-101 |
| Blocked tasks | 1 — T-104 |
| Missing due dates | 1 — T-105 |

T-106 is due on the reporting date and is not overdue. T-107 is Completed and is not overdue.

## V1.0 boundary

V1.0 is a client-side, single-browser application. Database storage, authentication, workflow automation, RAG, and external AI agents are out of scope and are not runtime dependencies.
