# Task 01: Update TTS QA And Agent Docs

## Type

Code

## Context

The feature changes the end-to-end translation workflow by adding optional generated English audio after text translation. Repo docs and agent guidance need to reflect the new step, evidence expectations, and privacy boundaries.

## Implementation

- Update `ai_docs/fresh-clerk-user-qa.md` with TTS-specific verification steps.
- Update `server/AGENTS.md` and any directly relevant docs to mention OpenAI TTS after translation success.
- Include `ENABLE_TTS=true` in the QA path where appropriate.
- Add evidence guidance for audio playback without copying private audio contents, tokens, secrets, or full transcripts into docs.
- Preserve the existing fresh Clerk user QA acceptance path.

## Acceptance Criteria

- [ ] Fresh-user QA docs require verifying English audio playback when TTS is enabled.
- [ ] Server agent docs describe the updated pipeline accurately.
- [ ] Docs distinguish text translation success from TTS artifact success/failure.
- [ ] Docs do not include secrets, Clerk session tokens, `.env` values, private audio contents, or full provider transcripts.

## Dependencies

- Depends On: 04-mobile-playback-ui/add-history-detail-playback-control
- Blocks: run-static-and-api-verification

## Technical Notes

- Keep docs source-grounded with paths such as `server/translation-pipeline.mjs`, `server/artifacts.mjs`, `server/storage.mjs`, `lib/api.ts`, `app/translate.tsx`, and `app/history.tsx`.
- Evidence should include filenames, sizes, job IDs, and Trigger run IDs, not private payloads.

## Artifact Slots

- `artifacts/`: docs diff summary and QA evidence template updates.
- `references/`: current QA docs and root/server AGENTS guidance.
- `resources/`: checklist snippets for TTS-enabled fresh-user QA.
- `notes/`: documentation scope decisions.

