# Task 01: Backfill Or Retention Decision

## Type

Planning

## Context

Historical Supabase rows and storage objects may not need full migration if audio retention can expire old files. The decision must be explicit before Supabase removal.

## Implementation

- Count existing profiles, jobs, results, provider runs, and storage objects.
- Decide whether to backfill all rows, backfill metadata only, or keep a retention bridge.
- If backfilling, define export/import order and ID mapping.
- If not backfilling audio, define retention and user support behavior.

## Acceptance Criteria

- Historical data strategy is approved.
- Data parity requirements are documented.
- Audio retention policy is documented.
- Supabase remains read-only until the decision is complete.

## Dependencies

- Epic 05 complete.

## Validation Commands

```bash
rg -n "SUPABASE|supabase|@supabase" --glob '!node_modules/**' --glob '!refs/**'
```

## Artifact Slots

- `artifacts/`: backfill decision record.
- `notes/`: data retention and rollback notes.

