# Content Factory Constitution

## Core Principles

### I. Compliance First
All generated content must stay faithful to source facts and avoid prohibited or exaggerated claims. Automation must fail safe, not fail open.

### II. Prompt Traceability
Every rewrite must record which prompt was used. Prompts must be editable, ordered, and selectable per article.

### III. Reliable Data, Clear Recovery
Core data is persisted server-side. Errors are explicit, recoverable, and visible in the UI.

### IV. Clear UX Over Clever UX
Critical actions must be discoverable and reversible. Default choices must be visible and easy to override.

### V. Security and Secrets
API keys and tokens never leave the server. Secrets are not committed to the repo or logged.

## Technical Constraints

- Next.js App Router with React.
- Prisma for data access with SQLite in local development, migratable to Postgres/MySQL in production.
- External API calls are server-side only.

## Development Workflow

- Use Spec-Kit for new features: constitution → spec → plan → tasks → implement.
- Keep specs updated when behavior changes.
- Add or update tests when logic changes materially.

## Governance

This constitution overrides other guidance. Amendments require documenting the rationale and updating relevant specs.

**Version**: 1.0.0 | **Ratified**: 2026-01-06 | **Last Amended**: 2026-01-06
