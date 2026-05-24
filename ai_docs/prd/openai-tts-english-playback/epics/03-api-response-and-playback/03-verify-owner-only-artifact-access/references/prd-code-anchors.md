# PRD And Code Anchors

## PRD Alignment

- `03-product-goals-success-metrics.md`: authenticated playback requires cross-user denial.
- `10-risk-assessment.md`: generated audio can contain sensitive translated content.
- `11-definition-of-done.md`: QA must prove owner-only playback and no secret leakage.

## Repo Anchors

- `server/index.mjs`: playback route and auth middleware are the verification target.
- `server/artifacts.mjs`: owner-filtered artifact lookup is the data access boundary.
- `ai_docs/fresh-clerk-user-qa.md`: follow existing safe-evidence rules for Clerk users, job IDs, and Trigger run IDs.

## Execution Notes

- Use placeholder tokens in durable curl templates.
- Evidence should describe status codes and headers without copying audio bytes or private object keys.
