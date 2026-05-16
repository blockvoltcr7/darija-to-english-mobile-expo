---
phase: 2
worktree_mode: parallel
conflict_risk: low
branch: feat/eas-04-add-non-local-api-diagnostics
depends_on: [configure-eas-public-environments]
blocks: []
---

# Execution Strategy - add-non-local-api-diagnostics

Run after EAS public env values are configured. This can run in parallel with `audit-mobile-secret-boundary` because its likely write scope is local app/config code, while the audit is mostly inspection and task-local evidence.

Expected code touchpoints are `lib/config.ts` and the diagnostics UI in `app/translate.tsx`. The goal is to make the active API base URL visible enough for preview/staging QA and to flag local URLs such as `localhost`, `127.0.0.1`, or `10.0.2.2` when they appear in a non-local build context.

Keep local iOS simulator and Android emulator defaults working. Validate with `npm run typecheck` and `npm run lint`; broader Expo checks can run at phase or epic completion.
