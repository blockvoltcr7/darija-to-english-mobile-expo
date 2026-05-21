# 07 UI Component Changes

## Result Screen: `app/translate.tsx`

### Current Interface

The result screen shows:

- English translation.
- Consolidated Darija.
- Raw OpenAI transcript.
- Raw Darija transcript.
- Model metadata.
- Diagnostics.

It does not show generated English audio.

### Target Interface

Add a compact audio row inside or directly under the English translation result area:

```text
[play icon] Listen to English translation
AI-generated voice
```

States:

| State | UI |
| --- | --- |
| `tts === null` | Show no audio control. |
| `tts.status === "queued" || "running"` | Optional QA-only muted text: `Preparing audio...`. |
| `tts.status === "succeeded"` | Show Play/Pause control and audio metadata if diagnostics are open. |
| `tts.status === "failed"` | Do not block text result; diagnostics can show `Voice unavailable`. |

Behavior:

- No autoplay.
- Play only after explicit tap.
- Keep text selectable.
- Show a concise AI-generated voice disclosure near playback.
- Use existing visual style and avoid a new landing/hero-style surface.

## History Detail: `app/history.tsx`

### Current Interface

History detail loads a completed translation and shows text fields and provider run metadata.

### Target Interface

Show the same audio playback row when a historical translation has a successful TTS artifact.

Rules:

- Do not show audio availability in list rows unless it is cheap and already included.
- Do not autoplay.
- Use authenticated playback URL from the detail response.

## Client API: `lib/api.ts`

### Current Mapping

`toTranslationResult(detail)` maps only text result and model metadata.

### Target Mapping

Map:

```ts
tts: detail.tts || null
```

For playback URL, if the server returns a relative URL, resolve against `CONFIG.API_BASE_URL`:

```ts
const audioUrl = detail.tts?.audioUrl?.startsWith('http')
  ? detail.tts.audioUrl
  : detail.tts?.audioUrl
    ? `${CONFIG.API_BASE_URL}${detail.tts.audioUrl}`
    : null;
```

The playback request must include Clerk auth if Expo audio APIs cannot attach headers directly to a URI. If headers are not supported by the chosen playback API, use one of these approaches:

1. Fetch the audio bytes with Authorization and write a temporary local file before playback.
2. Use short-lived signed URLs generated server-side.

Preferred MVP: fetch authenticated bytes and play a local file if `expo-audio` cannot send auth headers.

## Type Changes

Before:

```ts
export interface TranslationResult {
  translation: string;
  englishText?: string;
  model: string;
}
```

After:

```ts
export interface TranslationResult {
  translation: string;
  englishText?: string;
  model: string;
  tts?: TranslationTtsArtifact | null;
}
```

## Accessibility

- Play button needs accessible label: `Play English translation audio`.
- Pause button needs accessible label: `Pause English translation audio`.
- Voice status text should not replace text result.
- AI voice disclosure should be visible, not only in diagnostics.
