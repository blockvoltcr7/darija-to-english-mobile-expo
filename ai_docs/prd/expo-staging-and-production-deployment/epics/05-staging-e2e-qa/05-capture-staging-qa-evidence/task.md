# Task 05: Capture Staging QA Evidence

## Type

Code

## Context

The staging proof must be reusable for release decisions. Evidence should connect app build, API URL, user, job, Trigger run, and final status without leaking secrets or unnecessary personal data.

## Implementation

- Create a QA evidence note under `ai_docs/deployment/` or this task's `artifacts/`.
- Include:
  - build profile and EAS build ID.
  - EAS environment used by the build profile.
  - staging API URL.
  - sanitized Clerk test user reference.
  - translation job ID.
  - Trigger run ID.
  - final app status.
  - screenshots of key app states.
  - links/notes for API and Trigger logs.
- Record any residual risks before store beta.

## Acceptance Criteria

- Evidence note exists and is sanitized.
- Evidence proves the fresh-user phone workflow completed successfully.
- Residual risks and blockers are explicit.
- Store beta prep does not proceed without this artifact.

## Dependencies

- Depends On: verify-translation-result-sections

## Technical Notes

- Do not include full secret values, session tokens, or private email verification codes.
- Keep enough identifiers to debug the exact run later.
- It is acceptable for a staging QA build to report EAS environment `preview` as long as diagnostics prove it targets the staging API.

## Artifact Slots

- `artifacts/`: final staging QA evidence package.
- `references/`: screenshots, logs, and run IDs.
- `resources/`: QA evidence template.
- `notes/`: residual risks and release recommendation.
