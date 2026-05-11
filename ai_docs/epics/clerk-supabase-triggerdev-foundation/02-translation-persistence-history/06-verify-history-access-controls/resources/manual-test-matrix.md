# Manual Test Matrix

| Case | Request | Expected Result |
|---|---|---|
| No auth list | `GET /v1/translations` | `401` |
| No auth detail | `GET /v1/translations/:id` | `401` |
| Auth list own rows | valid Clerk token | `200`, only caller rows |
| Auth detail own row | valid Clerk token and own id | `200` |
| Auth detail missing id | valid Clerk token and unknown id | `404` |
| Auth detail other user row | valid Clerk token and other user's id | `404` |

Use Supabase MCP with `project_id: npjsersrmvltoxmqdkzd` to verify row ownership and cleanup any temporary fixtures.
