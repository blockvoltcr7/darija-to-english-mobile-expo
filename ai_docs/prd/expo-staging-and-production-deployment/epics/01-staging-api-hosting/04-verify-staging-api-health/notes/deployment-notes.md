# Deployment Notes

- Successful Cloud Build ID: `a0a2c3d0-63c4-446a-b2c7-8248c0e318ba`.
- Earlier Cloud Build attempts failed because plain `npm ci --omit=dev` did not accept the current peer dependency lockfile state. The Dockerfile now uses `npm ci --omit=dev --legacy-peer-deps`.
- Successful Cloud Run revision: `darija-api-staging-00001-dt9`.
- `/health` verified that Clerk, Darija ASR, OpenAI, and Supabase dependencies are configured.
- No audio upload or paid provider translation call was executed in this task.
