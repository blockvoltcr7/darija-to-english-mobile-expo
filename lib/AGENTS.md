# AGENTS.md

## Scope

Shared mobile client configuration, API client logic, and TypeScript contracts.

## Files

| Path | Purpose |
| --- | --- |
| `api.ts` | Calls local/hosted API, attaches trace logs, normalizes responses. |
| `config.ts` | Reads Expo public configuration such as `EXPO_PUBLIC_API_BASE_URL`. |
| `types.ts` | Shared client-side API response types. |

## Contract Rules

- Keep `TranslationResult` compatible with the server response.
- Preserve aliases: `transcript` means consolidated Arabic/Darija; `translation` means English.
- Preserve raw transcript fields: `openaiArabicText`, `darijaArabicText`, and `consolidatedArabicText`.
- Keep diagnostics hooks optional; API functions should work without UI logging callbacks.
- Never put private API keys in Expo public config. `EXPO_PUBLIC_*` is visible to the app bundle.
- `translateAudioFile` must send the Clerk session token as `Authorization: Bearer <token>`.

## Device API URLs

- iOS simulator: `http://localhost:8787`
- Android emulator: `http://10.0.2.2:8787`
- Physical devices: `http://<mac-lan-ip>:8787`

## Verification

```bash
npm run typecheck
npm run lint
```
