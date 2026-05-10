# Planning Notes

Date: 2026-05-09

## Decision

Verification should be repeatable and evidence-oriented. Store actual command outputs in `artifacts/` when the implementation run performs them.

## Completion Rule

Do not claim live DB completion from local-only checks. Live completion requires applying the migration to the intended Supabase project and recording redacted verification output.

