# PRD And Code Anchors

## PRD Alignment

- `11-definition-of-done.md`: lists static checks, API health, and no-secret logging expectations.
- `09-implementation-phases.md`: static/API verification gates simulator QA.
- `03-product-goals-success-metrics.md`: health and metadata checks support release confidence.

## Repo Anchors

- `AGENTS.md`: repository verification commands and expected `/health` model fields.
- `server/index.mjs`: `/health` response and API route surface.
- `trigger/translate-audio-job.mjs`: Trigger syntax check target.

## Execution Notes

- Start `npm run api` before the health check if no API server is running.
- Summarize command outputs safely and avoid copying env values.
