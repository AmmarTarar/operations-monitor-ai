
# Operations Monitor — Data & Knowledge Sources Inventory

## 1. Purpose
Identify the structured data and business knowledge required by the Operations Monitor and its planned AI Operations Review Agent.

## 2. Data Sources Inventory

| Source | Type | Owner / License | Format | Size | Update Frequency | Access Method | Preprocessing | PII / Sensitive | Status |
|---|---|---|---|---|---|---|---|---|---|
| Synthetic task records | Structured | Project-created | Manual / Table | Small | Per task entry | Application inputs | Validation and cleaning | No real PII | Test examples available |
| Business requirements | Documentation | Project owner | Markdown | Small | As revised | GitHub repository | None | No | Available |
| KPI definitions | Business rules | Project owner | Markdown | Small | As revised | Business requirements document | Rule verification | No | Available |
| Architecture document | Technical documentation | Project owner | Markdown | Small | As revised | GitHub repository | None | No | Available |
| Operational SOPs | Business knowledge | Project-created | Planned PDF / Markdown | Not prepared | As revised | Future document retrieval | Chunking and review | No real PII | Planned |
| Task database | Structured | Project-created | Planned SQLite database | Not prepared | As records change | Future controlled SQL tools | Schema validation | Synthetic data only | Planned |

## 3. Data Preparation Principles

- Use synthetic operational records for demonstrations.
- Validate task IDs, dates, status and priority.
- Avoid confidential company records and employee personal information.
- Keep business rules consistent across application logic and AI instructions.
- Document data ownership and usage permissions.
- Verify source accuracy before using documents for RAG.

## 4. Future RAG Preparation Checklist

- [ ] Operational SOP corpus assembled.
- [ ] Document ownership and usage permissions confirmed.
- [ ] Chunking strategy defined.
- [ ] Embedding model selected.
- [ ] Vector store selected.
- [ ] Retrieval and citation strategy tested.
- [ ] Sensitive information removed.

## 5. Future Structured Data Preparation

- [ ] Task database schema defined.
- [ ] Synthetic task dataset prepared.
- [ ] SQL read-only access configured.
- [ ] Query validation implemented.
- [ ] Output limits established.
- [ ] Tool calls logged and tested.

## 6. Current Assessment

The project currently has an HTML/JavaScript prototype, documented business requirements and an initial architecture.

The prototype uses client-side task data. A persistent database, operational SOP corpus, RAG pipeline and external AI integrations have not yet been implemented.

These will be developed and evaluated in subsequent challenge stages.
