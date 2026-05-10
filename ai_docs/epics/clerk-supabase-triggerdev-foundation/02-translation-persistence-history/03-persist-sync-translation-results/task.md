# Task 03: Persist Sync Translation Results

## Type

Code

## Context

`POST /v1/translate-audio` should continue working synchronously while also creating durable translation history.

## Implementation

- Update the current `/v1/translate-audio` flow to create a job row before provider calls.
- Write provider runs around existing OpenAI and Modal calls.
- Write `translation_results` on success.
- Mark the job `failed` with a user-safe error on failure.

## Acceptance Criteria

- Existing response shape remains compatible with mobile UI.
- Successful translation writes job/result/provider rows.
- Failed translation writes a safe failure record.

## Dependencies

- Depends On: create-translation-db-writers

## Technical Notes

- Preserve existing raw transcript aliases in the response.
- Do not introduce bucket storage or async job dispatch here.

## Artifact Slots

- `artifacts/`: successful and failed DB row examples.
- `references/`: sequence diagram and existing endpoint flow.
- `resources/`: test audio/curl payload references.
- `notes/`: compatibility notes.
