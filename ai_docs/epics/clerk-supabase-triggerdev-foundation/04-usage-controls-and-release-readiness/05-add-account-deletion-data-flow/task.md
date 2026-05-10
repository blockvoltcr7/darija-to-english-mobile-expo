# Task 05: Add Account Deletion Data Flow

## Type

Code

## Context

Store readiness requires a clear account deletion path covering profiles, translations, provider metadata, and storage objects.

## Implementation

- Define deletion/anonymization behavior for profiles, jobs, results, provider runs, usage rows, webhook events, and storage objects.
- Ensure deletion is keyed by `clerk_user_id`.
- Document whether transcripts are deleted or anonymized.

## Acceptance Criteria

- Account deletion data flow is explicit.
- Storage object deletion path is included.
- App data is not tied to `auth.users`.

## Dependencies

- Depends On: add-storage-retention-cleanup

## Technical Notes

- Keep legal copy aligned with the actual retention/deletion behavior.
- RevenueCat/customer billing deletion is out of scope for this foundation epic.

## Artifact Slots

- `artifacts/`: deletion flow diagrams or SQL drafts.
- `references/`: storage retention diagram and legal requirements notes.
- `resources/`: deletion test commands.
- `notes/`: retention/anonymization decisions.
