# Task 02: Skip Existing Successful TTS Artifacts

## Type

Code

## Context

Trigger retries and manual reruns must not duplicate paid OpenAI TTS calls when the same job already has a successful artifact for the same English text, provider, model, voice, and format.

The PRD requires an idempotency hash over English text and provider configuration.

## Implementation

- Compute the TTS idempotency hash before creating or running the artifact.
- Use `findSuccessfulTtsArtifact(...)` before calling OpenAI.
- If a successful matching artifact exists, skip the provider call and return/reuse its metadata.
- Ensure in-flight or failed artifacts are handled deliberately: do not silently reuse failed audio; do not generate duplicates under normal retry races.
- Keep the unique index and repository behavior aligned.

## Acceptance Criteria

- [ ] Re-running a completed job with the same English text and TTS config does not call OpenAI again.
- [ ] Changing voice, model, format, provider, or English text changes the hash and allows a new artifact.
- [ ] Failed artifacts do not masquerade as successful playback.
- [ ] Duplicate/retry races are handled by repository logic or database uniqueness, with safe errors.

## Dependencies

- Depends On: run-tts-after-translation-success
- Blocks: record-tts-failure-without-failing-text-result

## Technical Notes

- This task is cost-control work as much as correctness work.
- If the pipeline supports manual regeneration later, that should be an explicit new operation rather than accidental duplicate retry behavior.

## Artifact Slots

- `artifacts/`: idempotency test notes and duplicate-run evidence.
- `references/`: hash helper implementation and idempotency index.
- `resources/`: sample hash inputs and expected reuse behavior.
- `notes/`: retry race decisions and regeneration assumptions.

