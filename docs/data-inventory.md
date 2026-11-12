
# Operations Monitor V1.0 — Data Inventory

## Purpose

Document the data used by the offline V1.0 application and the controls applied before a record can influence KPIs, exceptions, workload, or recommendations.

## Current data sources

| Source | Type | Owner / license | Format | Access | Processing | Sensitivity | V1.0 status |
|---|---|---|---|---|---|---|---|
| `data/sample_tasks.csv` | Structured synthetic task data | Project-created | CSV | Local project file | CSV parse and record validation | No real PII | Canonical initial dataset |
| User-imported task CSV | Structured task data | User-controlled | CSV | Local browser file picker | Full-file validation before replacement | Must be assessed by user | Supported |
| Manual task entry | Structured task data | User-controlled | Browser form | Local browser | Field validation before insertion | Must be assessed by user | Supported |
| Browser local storage | Application state | Browser user | JSON | Same browser origin | Saved after accepted data changes | Local to browser profile | Supported when available |
| Business rules | Documentation | Project owner | Markdown/JavaScript | Local project files | Implemented deterministically | No | Supported |

## Canonical sample dataset

`data/sample_tasks.csv` contains seven synthetic records: T-101 through T-107. With the default reporting date of `2026-11-07`, its expected results are 7 total tasks, 2 completed tasks, 28.57% completion, 1 overdue task, 1 blocked task, and 1 missing due date.

The runtime attempts to load this canonical file first. A built-in, matching fallback exists solely so the interface remains usable in browsers that block local `file://` fetches; the recommended local HTTP launch route loads the CSV source file itself.

## Validation and handling rules

- Import requires all six headers: `task_id`, `task_name`, `owner_id`, `due_date`, `status`, and `priority`.
- The import parser supports quoted CSV fields and reports malformed quoting, missing headers, wrong row widths, invalid dates, invalid values, missing task IDs/names, and duplicate task IDs.
- Blank due dates are retained and flagged. Blank owners are retained and shown as **Unassigned**.
- If any import issue is found, the current dataset remains unchanged. The interface exposes the complete validation list rather than silently omitting records.
- Exported CSV uses the same six-column schema and quoting rules.

## Data protection guidance

- The supplied dataset is synthetic and contains no real personal information.
- V1.0 has no authentication, encryption layer, server, or shared database. Do not import confidential production data without an approved local data-handling process.
- Recommendations only operate on the fields present in the task dataset. They do not retrieve documents, inspect external data, or infer factual causes.

## Deferred sources

Operational SOPs, databases, retrieval indexes, SQL tools, and external models are not V1.0 data sources. They are deliberately excluded to preserve the fully offline, no-subscription architecture. Any later integration requires a new security, data ownership, and architecture review.
