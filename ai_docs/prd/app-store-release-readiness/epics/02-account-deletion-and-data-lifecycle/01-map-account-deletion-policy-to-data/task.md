# Map Account Deletion Policy To Data

## Type

Code

## Context

Apple expects users who create accounts to initiate deletion in app. The PRD also requires deletion behavior to match the public policy and privacy inventory across Clerk, profiles, translations, provider metadata, storage, and artifacts.

## Implementation

- Inventory user-owned data surfaces: Clerk account, app profile, translation jobs/results, provider run metadata, original audio storage, generated TTS artifacts, and audit events.
- Decide for each surface whether data is hard deleted, soft deleted, anonymized, or retained as minimal audit metadata.
- Map policy language to exact implementation behavior and verification evidence.
- Identify storage object key sources needed for deletion.
- Record provider-side retention caveats so policy wording does not overpromise.

## Acceptance Criteria

- Deletion mapping exists under `artifacts/` and covers all data categories in the PRD inventory.
- Each data surface has an intended cleanup method and verification method.
- The mapping avoids preserving private transcript/audio content in audit evidence.
- Open decisions are clearly marked before UI/API implementation proceeds.

## Dependencies

- Depends On: `01-legal-privacy-and-consent/update-privacy-inventory-and-release-copy`

## Technical Notes

- The server must derive ownership from the verified Clerk session; clients must not send a `clerk_user_id` to delete.
- Storage cleanup must delete private Supabase Storage objects, not only database rows.

## Artifact Slots

- `artifacts/`: policy-to-data deletion matrix
- `references/`: schema/storage/privacy inventory anchors
- `resources/`: verification query checklist with no private content
- `notes/`: unresolved policy and provider-retention decisions

