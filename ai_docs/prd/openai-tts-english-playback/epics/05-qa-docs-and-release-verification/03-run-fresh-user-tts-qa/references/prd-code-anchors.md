# PRD And Code Anchors

## PRD Alignment

- `11-definition-of-done.md`: fresh Clerk user QA must confirm text results, diagnostics, metadata, and English audio playback.
- `03-product-goals-success-metrics.md`: mobile playback and authenticated generation are success metrics.
- `09-implementation-phases.md`: this is the end-to-end QA phase after static/API checks.

## Repo Anchors

- `AGENTS.md`: fresh Clerk user acceptance path and local runtime commands.
- `.agents/skills/ios-simulator-files/scripts/add_to_simulator_files.sh`: simulator file-loading helper for non-sensitive audio fixtures.
- `app/translate.tsx` and `app/history.tsx`: UI surfaces to verify.

## Execution Notes

- Use an iOS development build, not Expo Go.
- Record job ID and Trigger run ID, but do not copy Clerk tokens, private audio contents, full transcripts, or audio bytes.
