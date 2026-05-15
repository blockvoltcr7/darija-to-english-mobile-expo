# 08 — Definition Of Done

## Completion Criteria

- [ ] `eas.json` exists with `development`, `preview`, `staging`, and `production` profiles.
- [ ] EAS project is initialized and associated with the Expo app.
- [ ] EAS development and preview public environment variables are configured with the staging API URL; production public environment variables are configured only after a production API URL exists.
- [ ] No server secrets are present in Expo public environment variables.
- [ ] Staging API host is selected and documented.
- [ ] Staging API deploys `server/index.mjs` and returns expected `/health`.
- [ ] Production API deployment path is documented even if production deploy is deferred.
- [ ] Trigger.dev Development worker is connected and verified.
- [ ] Trigger.dev production deployment command/path is documented.
- [ ] Preview iOS build installs on a physical iPhone.
- [ ] Preview build diagnostics show a non-local HTTPS API URL.
- [ ] Fresh Clerk test user can sign up/sign in on the preview build.
- [ ] Fresh-user History does not expose previous user rows.
- [ ] Audio upload from phone reaches a queued translation job.
- [ ] Trigger run succeeds for the uploaded audio.
- [ ] App displays English translation, consolidated Darija, raw OpenAI transcript, raw Darija model transcript, and model metadata.
- [ ] Staging QA captures sanitized job ID, Trigger run ID, API URL, build profile, and final status.
- [ ] Deployment runbooks exist under `ai_docs/deployment/`.
- [ ] Verification commands pass:

```bash
node --check server/index.mjs
node --check trigger/translate-audio-job.mjs
npm run typecheck
npm run lint
npx expo-doctor
curl https://<staging-api>/health
```

## Key Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Mobile deployment platform | Use EAS Build and EAS Submit. | Official Expo path for native iOS/Android builds and store submissions. |
| Pre-public testing | Use EAS internal distribution first, then TestFlight / Google Play testing. | Fast phone QA first, then production-like store beta. |
| Backend deployment | Deploy standalone Express API separately. | Current API is not an Expo Router API route app. |
| API refactor | Defer Expo Router API route migration. | Avoids unnecessary runtime migration before beta. |
| Environment config | Use EAS env vars for `EXPO_PUBLIC_API_BASE_URL`. | Prevents local defaults from leaking into phone builds. |
| Secrets boundary | Keep OpenAI, Modal, Supabase service role, Clerk secret, and Trigger secrets server-side. | Mobile clients cannot safely hold paid-service or service-role credentials. |
| Trigger runtime | Use Trigger.dev Development for this no-paid scope; document production deployment separately. | Queued jobs require a connected worker, and paid Staging/Preview environments are deferred. |
| QA gate | Fresh Clerk user staging E2E is required before production rollout. | Confirms auth isolation, storage, Trigger, provider calls, polling, and UI result rendering. |

## Handoff Command

```bash
seed-epic ai_docs/prd/expo-staging-and-production-deployment
```
