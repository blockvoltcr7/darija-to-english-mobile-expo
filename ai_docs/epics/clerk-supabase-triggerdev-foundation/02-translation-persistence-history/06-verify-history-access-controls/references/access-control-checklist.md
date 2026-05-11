# Access Control Checklist

## API

- `GET /v1/translations` requires Clerk auth.
- `GET /v1/translations/:id` requires Clerk auth.
- List query filters by `clerk_user_id`.
- Detail query filters by both `id` and `clerk_user_id`.
- Cross-user detail returns `404`.

## Database

- New tables have RLS enabled.
- New tables do not grant direct `anon` or `authenticated` access.
- Service-role server access is the only intended data path.

## Artifacts

- Redact bearer tokens.
- Redact full transcript bodies unless synthetic.
- Capture status codes and row counts.
- Capture cleanup evidence for any QA fixture rows.
