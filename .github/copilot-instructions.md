# Workspace Instructions — Home Health Policies & Procedures

## Agent Source Labeling (MANDATORY)

Every response that uses tools or agents MUST label the source:

- **[ASKVANESSA MCP]** — Data from AskVanessa (collections, records, files, workflows, search, globals).
- **[COPILOT / LOCAL]** — Code generation, file edits, terminal commands, local project analysis (GitHub Copilot / editor agents).

## When to Use Each

### [ASKVANESSA MCP]
- Query or modify **collections** (policies, procedures, compliance records, training modules, audit logs).
- Search across Home Health Agency data.
- Trigger or inspect **workflows** (approval chains, audit schedules).
- Read/write **files** managed by AskVanessa.
- Access **global** configuration or settings.

### [COPILOT / LOCAL]
- Generate, edit, or refactor local source code and documents.
- Run terminal commands (build, lint, test).
- Analyze local project structure and files.
- Create or modify Markdown, JSON, and config files in this workspace.

## Safety Rules

1. **Check schema before writes** — Before creating or updating any AskVanessa record, retrieve the collection schema first.
2. **Confirm destructive actions** — Deletions, bulk updates, or workflow triggers require explicit user confirmation.
3. **Prefer structured queries** — Use precise field filters and IDs; never guess record IDs or field names.
4. **Never expose secrets** — Do not print, log, or echo API keys or tokens.

## Domain Context

This workspace supports a **Home Health Agency** system covering:
- Policies & Procedures
- Regulatory Compliance
- Staff Training & Competency
- Audit & Quality Assurance
