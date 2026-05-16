# Approved Users Allowlist

The production allowlist file `approved-users.csv` must be placed in this `config/` directory before deploying the application.

This file is intentionally **not tracked in git** (add `config/approved-users.csv` to `.gitignore` if not already present) to avoid committing PII.

## Expected CSV Columns

- `email`: user email address (required, normalized to lowercase)
- `fullName`: full display name
- `sfOrgId`: Salesforce Org ID (required, normalized to uppercase, no spaces)
- `role`: user role (e.g. Admin, Trainer)
- `department`: department name
- `status`: `active` or `inactive` (inactive users are denied login/registration)
- `notes`: optional free-form notes

The first row must be the header exactly as shown above.

## Reconciliation

Use the `auditAllowlistCoverage` function exported from `server/auth/approvedUsers.ts` to audit existing users (e.g. from Cognito/Dynamo) against the allowlist. This is audit-only and never mutates or disables accounts automatically.

See the function documentation for details and emitted structured log events.