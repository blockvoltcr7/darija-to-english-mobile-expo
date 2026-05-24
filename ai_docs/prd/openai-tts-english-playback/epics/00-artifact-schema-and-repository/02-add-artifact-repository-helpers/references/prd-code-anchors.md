# PRD And Code Anchors

## PRD Alignment

- `05-architecture-plan.md`: names `server/artifacts.mjs` as the repository boundary.
- `06-technical-specifications.md`: defines helper contracts for finding successful TTS artifacts, marking lifecycle states, and fetching owner-owned audio artifacts.
- `10-risk-assessment.md`: idempotency and private audio exposure are the main risks this repository must reduce.

## Repo Anchors

- `server/translations.mjs`: use its normalization, safe metadata, ownership filters, and repository error style as the closest local pattern.
- `server/db.mjs`: use the existing Supabase admin client rather than creating a second client path.
- `server/index.mjs`: downstream route handlers should call repository helpers instead of embedding table queries.

## Execution Notes

- Every owner-sensitive read should require both `job_id` and `clerk_user_id`.
- Store only safe error code/message fields; never persist audio bytes, tokens, or provider responses.
