# Operations Monitor V1.0 — DDS Challenge Submission Evidence

**Participant:** Ammar Ahmad Tarar  
**Project:** Operations Monitor V1.0  
**Repository:** https://github.com/AmmarTarar/operations-monitor-ai  
**Release commit:** `526f066` — Release Operations Monitor V1.0

This folder contains supporting challenge reports, evaluation evidence, and the Day 8 community article. The application source code and primary run instructions remain in the repository root README and `app/` folder.

## Application overview

Operations Monitor V1.0 is a custom-coded, local, offline task-monitoring prototype built with HTML, CSS, JavaScript, and a small Node.js static server. It validates task records, imports and exports CSV files, calculates operational KPIs, identifies overdue/blocked/missing-deadline exceptions, summarizes task counts by owner, and produces deterministic rules-based supervisory recommendations.

**Important scope statement:** V1.0 does not call a live LLM or external AI/API at runtime. The earlier Gemini/Langflow experiment was discontinued after free-tier quota and service-availability issues. The delivered monitoring and recommendations are deterministic business rules, not generative AI.

## Contents

### `reports/`
- `DDS_Challenge_Progress_Workbook_Day6_Updated.pdf` — submission-ready progress workbook through Day 6.
- `DDS_Challenge_Progress_Workbook_Day6_Updated.docx` — editable workbook source.

### `evaluation/`
- `Operations_Monitor_Evaluation_Dataset_and_Results_Day7.xlsx` — task test data, expected classifications, evaluation summary, manual test evidence, and security/readiness notes.

### `article/`
- `Operations_Monitor_Community_Blog_Day8.pdf` — PDF version of the community article.
- `Operations_Monitor_Community_Blog_Day8.docx` — editable article.
- `assets/` — header and workflow illustrations used with the article.

### `evidence/`
- `Operations_Monitor_Dashboard_Sample.png` — sample dashboard evidence from the development/testing process.

## Verified release evidence carried forward

- Release commit: `526f066` on `main`.
- Automated test run documented for V1.0: **20 passed, 0 failed**.
- Manual acceptance and validation evidence is documented in the progress workbook. Counts and scope differ by checkpoint; consult each report for the exact cases recorded.
- CSV import/export, schema validation, duplicate-ID rejection, reporting-date logic, KPI/exception calculations, and browser localStorage persistence were exercised during the documented tests.

Do not interpret the recorded test count as a formal security audit or large-scale load/performance benchmark. A 10,000-record load test has not been completed.

## Known limitations and future work

- Browser `localStorage` is local to a browser profile; there is no centralized database or multi-user synchronization.
- V1.0 has no authentication, role-based access control, manager approval workflow, or audit log.
- Backups are manual CSV exports; automated backup/restore orchestration is not implemented.
- Workload analysis counts tasks by owner. It does not measure task effort, complexity, employee skills, or true capacity utilization.
- There is no public cloud demo URL in this package. The application has been run locally using the instructions in the root README.
- A production deployment would require security architecture, controlled access, centralized persistence, auditability, backup/recovery, and appropriate privacy review.

## Reproduce the local application

From the repository root, follow the run instructions in the root `README.md`. The documented local workflow uses Node.js and the command:

```powershell
node app/serve.mjs
```

Then open:

```text
http://127.0.0.1:8000/app/
```

Keep the server terminal open while using the app. To run the documented automated tests:

```powershell
node --test app/tests/operations-monitor.test.mjs
```

## Links

- GitHub repository: https://github.com/AmmarTarar/operations-monitor-ai
- Application: Operations Monitor V1.0
- Participant: Ammar Ahmad Tarar

## Submission status notes

The GitHub repository was confirmed public by the participant during the Day 8 submission process. Explainer video, demo video, and cloud deployment links must be added only after the real artifacts/URLs are created. Do not insert placeholder URLs as if they are completed deliverables.
