# Epic 03: Convex Storage And Upload Flow

## Objective

Replace Supabase Storage and base64-heavy upload paths with Convex file storage and upload URL flow.

## Scope

- Generate upload URLs.
- Store Convex `storageId` on jobs.
- Replace server storage adapter.
- Update mobile upload to direct file upload.
- Verify large audio constraints.

## Out Of Scope

- Removing Trigger.dev.
- Full historical audio backfill.
- Public file serving.

## Tasks

| # | Task | Type | Depends On |
| --- | --- | --- | --- |
| 01 | `create-upload-url-flow` | Code | Epic 02 |
| 02 | `replace-supabase-storage-adapter` | Code | `create-upload-url-flow` |
| 03 | `update-mobile-upload-client` | Code | `create-upload-url-flow` |
| 04 | `verify-large-audio-path` | QA | `replace-supabase-storage-adapter`, `update-mobile-upload-client` |

## Verification

- New jobs use Convex `storageId`.
- Large audio does not pass through Convex HTTP action JSON body.
- Original audio remains private.

