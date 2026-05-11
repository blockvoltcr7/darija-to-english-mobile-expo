# Storage Bucket Verification

Task: `create-private-storage-buckets`
Project ref: `npjsersrmvltoxmqdkzd`
Date: 2026-05-10

## Result

Created and verified two private Supabase Storage buckets:

| Bucket | Public | File size limit | Allowed MIME types |
|---|---:|---:|---|
| `audio-originals` | `false` | `50000000` bytes | `audio/aac`, `audio/m4a`, `audio/mp4`, `audio/mpeg`, `audio/ogg`, `audio/wav`, `audio/webm`, `audio/x-m4a` |
| `translation-artifacts` | `false` | `10000000` bytes | `application/json`, `text/plain` |

## Verification Commands

The first attempted verification used Supabase MCP SQL:

```sql
select id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
from storage.buckets
where id in ('audio-originals', 'translation-artifacts')
order by id;
```

The MCP server returned a permission error for this project:

```text
MCP error -32600: You do not have permission to perform this action
```

The bucket creation and verification were completed with the repo's server-side Supabase credentials through `@supabase/supabase-js`. No secret values were printed.

Sanitized verification output:

```json
{"id":"audio-originals","name":"audio-originals","public":false,"fileSizeLimit":50000000,"allowedMimeTypes":["audio/aac","audio/m4a","audio/mp4","audio/mpeg","audio/ogg","audio/wav","audio/webm","audio/x-m4a"]}
{"id":"translation-artifacts","name":"translation-artifacts","public":false,"fileSizeLimit":10000000,"allowedMimeTypes":["application/json","text/plain"]}
```

## Policy Boundary

No broad mobile/client Storage policy was created in this task. Access remains server-mediated:

- The Expo app has no Supabase Storage client.
- `.env.example` keeps Supabase secret/service credentials backend-only.
- Product ownership continues to live in Postgres via `translation_jobs.clerk_user_id`, not in `storage.objects.owner_id`.

## Documentation Checked

- Supabase Storage bucket creation: https://supabase.com/docs/guides/storage/buckets/creating-buckets
- Supabase Storage overview: https://supabase.com/docs/guides/storage
