# Secret Ownership Notes

- `.env.local` remains local-only and must not be committed.
- Secret values were sourced from local `.env.local` and stored in Google Secret Manager under project `darija-to-english-expo`.
- Documentation records only variable names and present/missing status.
- The staging service should use dedicated runtime service account `darija-api-staging-run@darija-to-english-expo.iam.gserviceaccount.com`.
- That service account has project-level Secret Manager accessor rights for first staging. Before production, consider narrowing IAM to individual secrets.
