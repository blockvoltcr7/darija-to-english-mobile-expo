# Epic 04: Mobile Playback UI

## Objective

Let signed-in users explicitly play generated English audio from the translation result screen and history detail screen.

## Scope

- Extend shared TypeScript result contracts and API mapping.
- Add an authenticated playback helper if Expo playback cannot attach auth headers directly.
- Add compact Play/Pause UI under English translation.
- Add matching playback support in history detail.

## Out Of Scope

- Autoplay.
- Darija synthesis.
- Showing audio availability in history list rows unless already cheap from existing data.

## Tasks

| # | Task | Type | Depends On |
|---|---|---|---|
| 01 | `add-client-tts-types-and-api-mapping` | Code | `03-api-response-and-playback/add-tts-detail-response-shape` |
| 02 | `add-authenticated-audio-playback-helper` | Code | `add-client-tts-types-and-api-mapping` |
| 03 | `add-translate-result-playback-control` | UI | `add-authenticated-audio-playback-helper` |
| 04 | `add-history-detail-playback-control` | UI | `add-translate-result-playback-control` |

## Verification

- Completed translations with `tts.status === "succeeded"` show a Play/Pause control.
- `tts === null` shows no audio control.
- Failed TTS does not block or hide English text.
- UI includes a visible AI-generated voice disclosure.

<!-- ENRICHED-OVERVIEW-START -->
## Enriched Overview

### Scope

This epic adds mobile client contracts and explicit playback UI while preserving the app's text-first translation experience. Playback must use authenticated API access and stay compact on both the result screen and history detail.

### Task Summary

| # | Slug | Type | Summary | Key Dependencies |
|---|---|---|---|---|
| 01 | `add-client-tts-types-and-api-mapping` | Code | Extend `lib/types.ts` and `lib/api.ts` so polling and history detail preserve `tts` null/succeeded/failed states and resolve relative playback URLs when needed. | Epic 03 detail response; `CONFIG.API_BASE_URL`; existing result aliases. |
| 02 | `add-authenticated-audio-playback-helper` | Code | Add reusable authenticated playback logic that uses fresh Clerk tokens and either direct header playback or temporary local files. | Task 01; playback route verification; installed Expo audio/file APIs. |
| 03 | `add-translate-result-playback-control` | UI | Add compact Play/Pause control and AI voice disclosure under the English translation only when TTS succeeded. | Task 02; `app/translate.tsx` result layout. |
| 04 | `add-history-detail-playback-control` | UI | Reuse playback behavior in `app/history.tsx` detail view without changing list rows or hiding text results. | Task 03; history detail state and navigation cleanup. |

### Execution Notes

- Shared files likely touched: `lib/types.ts`, `lib/api.ts`, a shared playback helper/hook, `app/translate.tsx`, and `app/history.tsx`.
- Do not autoplay. Playback starts only from explicit user action.
- Failed or missing TTS must not visually dominate the screen or block the English text result.

<!-- ENRICHED-OVERVIEW-END -->
