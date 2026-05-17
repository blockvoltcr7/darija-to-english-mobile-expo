# Task 04: Add Release Rollback Checklist

## Type

Code

## Context

Epic 05 proved the app works only when the full chain is healthy: mobile build, HTTPS API, Clerk, Supabase, Trigger.dev Development worker, Modal, and OpenAI. Epic 06 needs an operator-facing release and rollback checklist so TestFlight/Play testing and future production releases do not rely on chat memory or screenshots.

## Implementation

- Create or update `ai_docs/deployment/release-checklist.md` using `ai_docs/deployment/README.md`, `api-hosting.md`, `triggerdev.md`, `eas.json`, `app.json`, and Epic 05 QA evidence.
- Add pre-release gates for build profile, EAS channel/environment, API URL, Clerk keys, Trigger runtime, Supabase/storage, provider health, and sanitized QA evidence.
- Add rollback sections for App Store/TestFlight or Play testing build withdrawal/replacement, EAS Update rollback, Cloud Run revision rollback, Trigger worker deploy rollback, env-var mistakes, and provider outage mitigation.
- Distinguish fast rollback from new binary requirement. Native changes, runtime-version changes, store metadata mistakes, and app identity changes may require a new build or store action.
- Include a no-go warning for wider beta/public release until usage controls and production API decisions are complete.

## Acceptance Criteria

- [ ] `ai_docs/deployment/release-checklist.md` exists and is linked or easy to discover from deployment docs.
- [ ] Checklist covers pre-release, release, rollback, and post-release verification for mobile, EAS Update, API, Trigger, env/config, and providers.
- [ ] Checklist references Epic 05 staging E2E evidence and requires job ID / Trigger run ID / API URL correlation without secrets.
- [ ] Checklist clearly says store beta can be go while public release remains no-go if usage controls, production API, legal/privacy, or account deletion are incomplete.
- [ ] Rollback steps use command shapes and source files already present in the repo, not generic advice.

## Dependencies

- Depends On: create-store-beta-builds
- Depends On: document-production-api-path
- Blocks: verify-release-readiness-gates

## Technical Notes

- Use `gcloud run services update-traffic` guidance already documented in `ai_docs/deployment/api-hosting.md` for API rollback.
- Use `eas update:rollback` only for compatible JS updates; `app.json` currently uses `runtimeVersion.policy = "appVersion"`.
- The Trigger no-paid QA path uses `npm run trigger:dev -- --env-file .env.local --skip-update-check`; production deploy remains separate through `npm run trigger:deploy:prod`.
- This is an internal operations document, not app-store release notes or marketing copy.

## Artifact Slots

- `artifacts/`: checklist review template and signoff notes.
- `references/`: source-map excerpts for EAS channels, EAS Update config, API rollback, Trigger runtime, and Epic 05 evidence.
- `resources/`: release and rollback command checklist.
- `notes/`: rollback gaps, manual store actions, and residual risks.
