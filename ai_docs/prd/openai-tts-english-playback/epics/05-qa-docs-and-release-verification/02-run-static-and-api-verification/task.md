# Task 02: Run Static And API Verification

## Type

Code

## Context

Before simulator QA, the repo should pass static checks and basic API health checks. The PRD definition of done lists exact commands.

## Implementation

- Run:

```bash
node --check server/index.mjs
node --check server/translation-pipeline.mjs
node --check trigger/translate-audio-job.mjs
npm run typecheck
npm run lint
npx expo-doctor
curl http://localhost:8787/health
```

- Confirm `/health` includes expected model fields and does not leak secrets.
- Capture failures as blockers with exact command names and safe error summaries.
- Do not paste `.env` values or provider keys into artifacts.

## Acceptance Criteria

- [ ] Server syntax checks pass.
- [ ] TypeScript typecheck passes.
- [ ] Lint passes or documented blockers are captured.
- [ ] `npx expo-doctor` passes or actionable blockers are captured.
- [ ] `/health` responds and includes expected model keys without secrets.

## Dependencies

- Depends On: update-tts-qa-and-agent-docs
- Blocks: run-fresh-user-tts-qa

## Technical Notes

- If the API server is not already running, start it with `npm run api` before the health check.
- Keep command output summaries concise and safe.

## Artifact Slots

- `artifacts/`: static check results and health response summary.
- `references/`: PRD definition-of-done command list.
- `resources/`: command transcript snippets with secrets redacted.
- `notes/`: blockers and remediation notes.

