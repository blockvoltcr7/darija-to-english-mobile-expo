---
phase: 2
worktree_mode: sequential
conflict_risk: high
branch: feat/clerk-02-authenticated-profile-upsert
depends_on: [add-profile-repository-helpers]
blocks: [verify-profile-sync-end-to-end]
---

# Execution Strategy - call-profile-upsert-after-clerk-verification

Phase 2. This is ready after `add-profile-repository-helpers`, but it should be
sequenced carefully with `add-clerk-webhook-endpoint` because both tasks modify
`server/index.mjs`.

Implement the lazy safety-net path immediately after `requireClerkSession` and
before any OpenAI, Modal, storage, Trigger.dev, or persistence work. Preserve the
existing `/v1/translate-audio` and `/translate-audio` response contracts; attach
only minimal profile context to the server request.

The main conflict risk is route/middleware ordering in `server/index.mjs`.
Complete or merge this before the webhook endpoint task rewires raw-body parsing
and route registration.
