
# Operations Review Rules — V1.0

## Status

This document preserves the operational-review intent of the original prompt draft. In V1.0 it is implemented as deterministic JavaScript rules in `app/js/analysis.js`, not as a prompt and not through an AI model or API.

## Inputs

The review reads only the current validated task records and selected reporting date:

- Task ID and task name
- Owner ID (which can be blank)
- Due date (which can be blank)
- Status and priority
- Selected reporting date

## Deterministic review rules

1. Calculate total tasks, completed tasks, and completion rate.
2. Identify overdue tasks only when the due date is valid, earlier than the reporting date, and status is not `Completed`.
3. Identify blocked tasks, missing due dates, and active High-priority tasks separately.
4. Produce workload counts grouped by owner, using **Unassigned** for blank owners.
5. For each current exception, state a recorded fact, label an information gap as an assumption, and recommend a supervisory action.

## Recommendation constraints

- Reference actual task IDs and recorded owners when present.
- Never invent a delay cause, impact, resolution, reassignment, or completed action.
- Never mutate task records.
- Treat critical action as a human supervisor decision.
- State no personal or confidential information beyond the fields held in the local record.

## Output shape

The V1.0 review renders KPI values, exception tables, and recommendation cards. Downloads include the same facts and actions in a local text exception report.

## Historical note

The previous document was an unconnected external-agent prompt proposal. The V1.0 rules retain its safety principles while intentionally removing any external model dependency.
