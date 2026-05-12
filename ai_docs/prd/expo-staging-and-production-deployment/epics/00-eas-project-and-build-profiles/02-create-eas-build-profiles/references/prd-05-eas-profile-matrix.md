# PRD 05 EAS Profile Matrix

PRD `05-technical-specifications.md` defines the baseline `eas.json` shape for this epic.

## Required Top-Level Shape

- `cli.version`: `>= 16.0.1`
- `cli.appVersionSource`: `remote`
- `build.development`
- `build.preview`
- `build.staging`
- `build.production`
- `submit.staging`
- `submit.production`

## Required Build Profile Intent

| Profile | Distribution | Environment | Channel | Notes |
| --- | --- | --- | --- | --- |
| `development` | `internal` | `development` | `development` | `developmentClient: true` |
| `preview` | `internal` | `preview` | `preview` | owner-device preview QA |
| `staging` | `store` | `preview` in PRD example, or documented `staging` decision | `staging` | `autoIncrement: true` |
| `production` | app-store default | `production` | `production` | `autoIncrement: true` |

## Explicit Secret Boundary

Do not include these values in `eas.json`:

- `OPENAI_API_KEY`
- `DARIJA_ASR_API_KEY`
- `CLERK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TRIGGER_SECRET_KEY`
- Modal secrets or bearer tokens
