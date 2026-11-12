
# Operations Monitor V1.0 — Application Architecture

## Purpose

V1.0 is an offline, browser-based application for monitoring operational tasks. It applies defined business rules to locally held data and presents evidence-based supervisory recommendations. It does not call an AI model, API, or cloud service.

## Runtime layers

1. **Presentation layer** — `app/index.html` and `app/css/styles.css` provide the responsive dashboard, forms, data controls, and tables.
2. **Ingestion and validation layer** — `app/js/csv.js` parses RFC-style quoted CSV values and requires all six headers. `app/js/task-schema.js` validates task IDs, names, dates, statuses, priorities, and duplicate IDs before data can replace the current dataset.
3. **Task state layer** — `app/js/app.js` owns the current task set and reporting date. `app/js/storage.js` safely reads and writes browser `localStorage`, degrading to a session-only experience if storage is unavailable.
4. **Operations rules layer** — `app/js/analysis.js` calculates KPIs, exception groups, workload by owner, and deterministic recommendations.
5. **Reporting layer** — the application safely creates DOM nodes for every user-supplied value and produces local CSV and text downloads.
6. **Local launch layer** — `app/serve.mjs` is a Node standard-library static server bound to `127.0.0.1`; it makes the project files available to the local browser without any package or network dependency.

## Data flow

```text
sample CSV / user CSV / manual form
             ↓
     parsing and validation
             ↓
     in-memory task state ↔ localStorage (when available)
             ↓
   KPI, workload, and exception rules
             ↓
 dashboard, rules-based review, local exports
```

The canonical initial source is `data/sample_tasks.csv`. When a browser blocks `fetch()` during a direct `file://` launch, a matching built-in fallback lets the application remain usable; the documented `node app/serve.mjs` launch route loads the CSV source file itself.

## Operations rules

- A valid due date is `YYYY-MM-DD` and must be a real calendar date; an empty due date is permitted and separately flagged.
- A task is overdue only when its valid due date is earlier than the selected reporting date and its status is not `Completed`.
- Completed tasks and same-day tasks are never overdue.
- Active (`not Completed`) High-priority tasks form the high-priority exception view.
- Completion rate is `Completed / Total × 100`, displayed to two decimal places. Empty datasets display `0.00%`.

## Reliability and security choices

- Import is transactional at the UI boundary: if any row has a malformed value or duplicate ID, no imported rows replace the active dataset.
- Safe DOM APIs (`textContent`, `createElement`) render task values; user content is never interpolated into `innerHTML`.
- Replace, clear, and reset actions require browser confirmation.
- Export content is generated locally with no network transfer.

## Technology

- HTML, CSS, and browser-native JavaScript modules
- Browser `localStorage`, File API, Blob download API, and Fetch API
- Node's built-in test runner and standard-library local static server

No third-party runtime package, cloud model, Langflow service, RAG pipeline, database, or API credential is required by V1.0.

## Current limitations

V1.0 is intentionally a single-browser local application. It has no user authentication, database, collaborative editing, audit trail, or individual-record editing workflow. Those capabilities would require a separately approved local or hosted architecture.
