
# Operations Monitor V1.0

Operations Monitor is a professional, locally runnable business operations monitoring application. It lets supervisors load task records, inspect KPIs and exceptions, review workload, and download a transparent rules-based exception report.

V1.0 works offline. It makes no API calls and has no paid service, cloud AI, external model, or third-party JavaScript dependency.

## What it does

- Loads the seven-record [sample dataset](data/sample_tasks.csv) on first use.
- Imports and validates CSV files before replacing current task data; an invalid import leaves the existing dataset intact and lists every issue found.
- Tracks total, completed, completion rate (two decimal places), overdue, blocked, and missing-due-date KPIs.
- Applies the documented reporting-date rules, including excluding completed tasks and same-day deadlines from overdue counts.
- Shows dedicated tables for overdue, blocked, missing-date, and active high-priority exceptions.
- Provides owner workload counts by status.
- Produces deterministic supervisory recommendations based only on recorded task fields. It does not present this as AI analysis.
- Saves the active dataset and reporting date in browser local storage when available.
- Exports task CSV files and downloadable text exception reports.

## Run locally on Windows

The application is dependency-free. To ensure the browser loads the canonical `data/sample_tasks.csv`, start the included local-only server from the project root:

```powershell
node app/serve.mjs
```

Then open [http://127.0.0.1:8000/app/](http://127.0.0.1:8000/app/) in a browser. The server binds only to `127.0.0.1` and works without an internet connection. Press `Ctrl+C` in the terminal to stop it.

If browser storage is blocked or unavailable, the application remains usable for the current browser session and clearly warns that changes cannot be retained after closing the page.

## Run automated tests

Node.js 18 or newer is sufficient; no package installation is required.

```powershell
node --test app/tests/operations-monitor.test.mjs
```

The test suite covers the acceptance dataset, KPI calculation, overdue boundaries, completed-task exclusion, missing dates, blocked tasks, duplicate IDs, malformed dates, missing columns, invalid status/priority values, empty datasets, and CSV export/import round-tripping.

## Project layout

```text
app/
  index.html                         V1.0 application entry point
  css/styles.css                     Responsive application styling
  js/                                CSV, validation, business rules, storage, DOM modules
  serve.mjs                           Local-only static server for Windows launch
  tests/operations-monitor.test.mjs  Dependency-free automated tests
  operations-monitor-baseline.html   Preserved original prototype
data/sample_tasks.csv                Canonical seven-record acceptance dataset
docs/                                Requirements, architecture, test evidence, and data notes
```

## V1.0 limitations

- Data is stored per browser via local storage; there is no shared database, authentication, or multi-user access.
- CSV import intentionally replaces the current dataset after confirmation; individual edit/delete screens are not included.
- The browser's local time is included in generated reports; task logic only uses the selected reporting date.
- The included sample data is synthetic. No personal or confidential operational data should be added without appropriate local controls.

## Historical note

The original baseline prototype remains at [app/operations-monitor-baseline.html](app/operations-monitor-baseline.html) unchanged. Earlier planning documents discussed possible external AI and Langflow experimentation; those ideas are not part of V1.0 and have no runtime dependency in this project.

## Project owner

Ammar Ahmad
Project direction: Operations Improvement and Business Intelligence.
