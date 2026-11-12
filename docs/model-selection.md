
# Operations Monitor V1.0 — Model Selection Status

## V1.0 decision

**No model is selected or used.** Operations Monitor V1.0 is deliberately dependency-free and fully offline. KPI calculations, exception classification, and supervisory recommendations are implemented through transparent local business rules.

This decision satisfies the current deployment constraints: no paid API, subscription, cloud service, external model dependency, or task data transfer outside the browser.

## What replaces a model in V1.0

`app/js/analysis.js` provides deterministic handling for:

- task counts and two-decimal completion rate;
- overdue, blocked, missing-date, and High-priority exceptions;
- owner workload aggregation; and
- fact/assumption/action supervisory recommendations tied to task IDs.

The behaviour is covered by Node-based automated tests and can be inspected directly in source code.

## Historical note and future boundary

Earlier drafts named Gemini and OpenAI candidates for a possible future agent. They were never integrated into the V1.0 application and are out of scope for this release. Any future model evaluation would require separate approval for cost, data handling, offline operation, security, accuracy, human oversight, and a revised architecture. It must not be inferred from this document or V1.0 code.
