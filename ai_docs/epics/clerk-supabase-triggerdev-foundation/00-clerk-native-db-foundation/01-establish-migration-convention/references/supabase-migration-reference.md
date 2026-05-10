# Supabase Migration Reference

Date checked: 2026-05-09

## Sources

- Supabase changelog index: `https://supabase.com/changelog.md`
- Database migrations guide: `https://supabase.com/docs/guides/deployment/database-migrations`
- Securing your API guide: `https://supabase.com/docs/guides/api/securing-your-api`
- Data API exposure changelog: `https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically`

## Relevant Findings

- Supabase migrations are SQL files tracked in `supabase/migrations/`.
- The documented creation flow is `supabase migration new <name>`, then editing the generated SQL file.
- Local testing should apply migrations to the local stack before live deployment.
- Live deployment is done through `supabase db push` after linking and review.
- Supabase warns that changing the remote database directly through Dashboard SQL editor or Table Editor bypasses migration history and can cause sync errors once migrations are adopted.
- Public schema Data API exposure is moving toward explicit grants. RLS controls rows after access is granted; grants control whether a role can reach the table at all.
- New public tables intended for Data API access should bundle `GRANT`, `ENABLE ROW LEVEL SECURITY`, and policy statements in the same migration.

## Changelog Items To Keep In View

- 2026-04-28: new tables in `public` are no longer automatically exposed to the Data API for projects that opt in, and this behavior becomes the default for new projects on 2026-05-30.
- 2026-05-07: Developer Update included database/security breaking-change items; migration authors should scan the changelog before implementing schema work.

