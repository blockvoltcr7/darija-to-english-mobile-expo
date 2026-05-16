# Mobile Env Matrix

| Context | Source | API URL |
| --- | --- | --- |
| Local iOS simulator | `.env.local` or shell | `http://localhost:8787` |
| Local Android emulator | `.env.local` or shell | `http://10.0.2.2:8787` |
| Local physical device | `.env.local` or shell | `http://<mac-lan-ip>:8787` |
| EAS development client | EAS `development` environment | `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app` |
| EAS preview | EAS `preview` environment | `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app` |
| EAS staging profile | EAS `preview` environment for now | `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app` |
| EAS production | EAS `production` environment later | Pending production API URL |

Only mobile-safe public values belong in EAS public env:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

Provider credentials, service-role keys, and Trigger credentials belong only on the API host or Trigger worker.
