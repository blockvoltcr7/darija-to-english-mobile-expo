# Support Mode Boundary

Use this file to record release-owner decisions if support visibility needs to differ from the default task behavior.

## Default Boundary

- Production default hides diagnostics and provider internals.
- Non-production/support mode may show safe operational IDs and authorized user-owned provider details.
- Backend/API response contracts remain unchanged.
- Documentation and screenshots must not include secrets, private audio, full transcripts, or generated audio bytes.

## Decision Log

| Question | Decision | Owner | Date |
| --- | --- | --- | --- |
| Should support mode be enabled in any public production build? |  |  |  |
| Which safe identifiers may support mode show? |  |  |  |
| Should raw provider transcripts be visible to normal users outside support mode? | Expected no |  |  |
| Should provider model names be visible to normal users outside support mode? | Expected no |  |  |
