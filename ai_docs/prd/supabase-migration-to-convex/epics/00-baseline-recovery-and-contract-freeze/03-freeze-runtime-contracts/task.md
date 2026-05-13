# Task 03: Freeze Runtime Contracts

## Type

Planning

## Context

The migration should not silently change the mobile UX, history shape, job statuses, health response, or legacy response aliases. These contracts must be frozen before implementation.

## Implementation

- Document `POST /v1/translations`.
- Document `GET /v1/translations`.
- Document `GET /v1/translations/:id`.
- Document legacy `/translate-audio` compatibility.
- Document health response expectations.
- Document mobile `TranslationResult` aliases.

## Acceptance Criteria

- Request and response shapes are documented with field names.
- Job statuses and terminal statuses are explicit.
- Legacy aliases are listed as preserved during migration.
- Contract changes require a deliberate later task.

## Dependencies

- `inventory-supabase-surfaces`

## Validation Commands

```bash
rg -n "AsyncTranslationSubmitResponse|TranslationHistoryDetail|TranslationResult" lib
rg -n "app.get\\('/v1/translations|app.post\\('/v1/translations|translate-audio" server/index.mjs
```

## Artifact Slots

- `artifacts/`: frozen API contract.
- `references/`: source excerpts from `lib/types.ts`, `lib/api.ts`, and `server/index.mjs`.

