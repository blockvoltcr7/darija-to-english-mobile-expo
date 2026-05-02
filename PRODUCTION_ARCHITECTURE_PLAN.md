# Production Architecture Plan (Darija/Moroccan Arabic Speech -> English)

## Current State (from this repo)

- Expo client uploads audio to a local API.
- Node/Express API runs:
  1. OpenAI transcription,
  2. Modal Darija ASR,
  3. OpenAI consolidation,
  4. OpenAI translation.

## Recommendation Summary

If your priority is **fastest path to production with minimal backend plumbing**, choose:

- **Supabase** for Auth + Postgres + Storage + observability basics.
- **Trigger.dev** for asynchronous audio jobs and retry/concurrency controls.
- Keep **OpenAI + Modal** as model providers behind your API.

If your priority is **maximum Postgres flexibility and branch-based DB workflows**, choose:

- **Neon** for Postgres,
- plus a separate auth layer (e.g., Clerk/Auth.js/custom JWT),
- plus object storage and realtime/event tooling separately.

Given your app roadmap (auth + queues + fast scale to ~10k users), the default recommendation is:

> **Supabase-first architecture**, then optionally migrate DB layer to Neon later if needed.

---

## Why this recommendation

### Supabase advantages for your case

- Built-in Auth reduces time to launch secure login/signup and session management.
- Managed Postgres with read replicas and platform features for operational scaling.
- Easier single-vendor MVP for mobile + API backend patterns.

### Neon advantages (and tradeoff)

- Excellent serverless Postgres design, branching workflows, autoscaling compute model.
- But Neon is DB-focused; you still need to assemble auth/storage/additional backend services.

### Trigger.dev fit

- Native queue + concurrency controls are useful for expensive AI steps (OpenAI + Modal), rate limits, and retries.
- Lets you keep API responsive by turning uploads into background tasks.

---

## Target Production Architecture

1. **Mobile App (Expo)**
   - Authenticated users only.
   - Upload audio file metadata + signed storage upload.

2. **API Layer (Node/Express or migration to serverless API)**
   - Verifies JWT from auth provider.
   - Creates `transcription_jobs` row.
   - Enqueues Trigger.dev job id.

3. **Storage**
   - Store original audio in object storage (Supabase Storage or S3-compatible).
   - Persist normalized outputs and provider metadata.

4. **Background Worker (Trigger.dev)**
   - Pulls job payload.
   - Calls OpenAI STT and Modal ASR in parallel.
   - Consolidates transcript and translates to English.
   - Writes status/result back to DB.

5. **Database (Postgres)**
   - Core tables: users, jobs, transcripts, billing/audit, usage counters.
   - Idempotency keys for repeated submissions.

6. **Realtime / Polling**
   - App polls job status or receives realtime updates.

7. **Observability**
   - Structured logs, trace IDs per job, metrics on p95 latency/cost per minute audio.

---

## Database choice decision matrix

- Choose **Supabase** if:
  - You want integrated auth now.
  - You want fewer moving parts in first production release.
  - You value built-in product velocity over lowest-level control.

- Choose **Neon** if:
  - You already standardized auth elsewhere.
  - You want advanced branching-first DB workflow and custom backend stack.
  - You accept extra integration work up front.

---

## 6-phase productionization roadmap

### Phase 0 (1-2 days): Safety and contracts

- Add strict request validation and max payload size.
- Add auth placeholders in API middleware.
- Define stable job status contract: `queued|running|succeeded|failed`.

### Phase 1 (3-5 days): Authentication

- Implement auth in mobile app.
- Require JWT on upload/job endpoints.
- Add per-user row-level access patterns in DB.

### Phase 2 (3-5 days): Async jobs

- Move AI pipeline from request-response into Trigger.dev task.
- Add retries with exponential backoff.
- Add queue concurrency limits to protect OpenAI/Modal quotas.

### Phase 3 (3-5 days): Data model + storage

- Add normalized tables for jobs, artifacts, provider runs, cost accounting.
- Move raw audio off request body to object storage uploads.
- Keep only storage pointers in DB.

### Phase 4 (2-4 days): Reliability + abuse controls

- Rate limiting by user + IP.
- Idempotency keys.
- Dead-letter handling for repeated failures.
- Health checks for OpenAI and Modal dependencies.

### Phase 5 (2-4 days): Scale tests + launch readiness

- Load test job ingestion and worker concurrency targets.
- Define SLOs and alerts.
- Add runbooks for provider outage/fallback mode.

---

## Minimum schema to add first

- `users` (if external auth, keep provider id mapping)
- `transcription_jobs`
  - `id`, `user_id`, `status`, `audio_url`, `duration_sec`, `created_at`, `updated_at`
- `transcription_results`
  - raw OpenAI transcript, raw Modal transcript, consolidated transcript, english translation
- `provider_runs`
  - provider name, model, latency, token usage, estimated cost, error code

---

## Risks and mitigations

- **Cost spikes**: enforce per-user quotas and monthly caps.
- **Provider instability**: circuit breakers and fallback policies.
- **Long audio latency**: chunking + parallel chunk processing for larger files.
- **Duplicate submissions**: idempotency key + content hash.

---

## Practical default stack (recommended)

- Auth + DB + Storage: **Supabase**
- Background jobs: **Trigger.dev**
- API runtime: existing **Node/Express** (later migrate if needed)
- AI providers: **OpenAI + Modal**
- Monitoring: Sentry + structured logs + DB cost dashboards

This gives the shortest path to a robust v1 and keeps future migration options open.
