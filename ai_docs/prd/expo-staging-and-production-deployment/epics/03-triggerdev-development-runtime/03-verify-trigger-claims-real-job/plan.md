---
phase: 3
worktree_mode: main
conflict_risk: none
branch: feat/triggerdev-03-verify-trigger-claims-real-job
depends_on: [run-trigger-development-worker]
blocks: [document-trigger-operations]
---

# Execution Strategy - verify-trigger-claims-real-job

Phase 3 runs only after the Trigger.dev Development worker is connected. Execute sequentially on the main working branch because this is an integration gate and may call paid providers.

Use the API path selected in Phase 1, a non-sensitive short `.m4a` fixture, and a valid Clerk test-user session token. Submit `POST /v1/translations`, capture `jobId`, `triggerRunId`, and `detailUrl`, then poll `GET /v1/translations/:id` until `succeeded` or `failed`.

Cross-check the same job/run in Trigger logs. If it fails, classify ownership with `notes/failure-classification.md` before retrying. Evidence belongs in `artifacts/development-job-evidence-template.md`; do not commit tokens, API keys, private audio contents, or full private transcripts.
