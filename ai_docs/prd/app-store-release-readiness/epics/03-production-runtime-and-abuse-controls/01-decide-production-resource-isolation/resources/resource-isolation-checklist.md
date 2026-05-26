# Resource Isolation Checklist

Create `artifacts/production-resource-isolation-matrix.md` with one row per resource.

| Resource | Decision | Owner | Public Or Secret Surface | Privacy/Legal Impact | Quota/Cost Impact | Blocks | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cloud Run API | Separate production / shared with risk / blocked |  | Public URL plus server secrets |  |  | Task 02 |  |
| Trigger.dev | Production worker / Development-only blocked / shared with risk |  | Server-only Trigger config |  |  | Task 03 |  |
| Clerk | Production keys/webhook / shared with risk / blocked |  | Publishable key public; secret/webhook server-only |  |  | Task 04 |  |
| Supabase | Separate production project / shared with risk / blocked |  | Server-only URL/secret/buckets |  |  | Task 04, account deletion |  |
| OpenAI | Production project/key / shared with risk / blocked |  | Server-only API key/model env |  |  | Task 04, Task 05 |  |
| Modal Darija ASR | Production endpoint/key / shared with risk / blocked |  | Server-only endpoint/key |  |  | Task 04, Task 05 |  |
| EAS production public env | Configure after production API URL / blocked |  | Public app bundle values |  |  | Epic 04/05 |  |

Allowed evidence: resource names, owner role, URL class, env variable names, status, blockers.

Disallowed evidence: secret values, Clerk session tokens, private audio, transcripts, provider request bodies, raw `.env` output, private dashboard screenshots.
