# Task 03: Record TTS Failure Without Failing Text Result

## Type

Code

## Context

The PRD is explicit: users should not lose the English translation because TTS generation failed. TTS errors need durable visibility for diagnostics and support, but they should not turn a completed text translation into a failed job.

## Implementation

- Wrap the TTS generation/upload path so provider or storage failures are captured separately from text result success.
- Mark the artifact failed with safe `error_code` and `error_message`.
- Ensure the translation job remains `succeeded` when text translation has already succeeded.
- Avoid retry loops that repeatedly bill or spam provider calls for known invalid input.
- Add safe diagnostic metadata for failed TTS status in pipeline return or persisted artifact state.

## Acceptance Criteria

- [ ] Forced OpenAI TTS failure records an artifact with `status = 'failed'`.
- [ ] Forced storage upload failure records safe failure metadata where possible.
- [ ] Translation job and text result remain visible after TTS failure.
- [ ] API detail can later expose `tts.status === "failed"` without exposing stack traces or secrets.
- [ ] Logs do not include full English text, generated audio bytes, provider secrets, or Clerk tokens.

## Dependencies

- Depends On: skip-existing-successful-tts-artifacts
- Blocks: add-tts-detail-response-shape

## Technical Notes

- Use user-safe error text such as `Speech generation failed.` for public API responses.
- Keep richer local debugging details out of persisted user-facing fields unless they are sanitized.

## Artifact Slots

- `artifacts/`: forced-failure run notes and resulting artifact row shape.
- `references/`: artifact failure helper and pipeline try/catch placement.
- `resources/`: provider-failure and storage-failure test switches.
- `notes/`: public versus internal error-message boundary.

