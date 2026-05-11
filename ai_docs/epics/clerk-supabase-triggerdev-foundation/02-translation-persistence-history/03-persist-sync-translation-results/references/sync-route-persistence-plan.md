# Sync Route Persistence Plan

Target route:

```text
server/index.mjs -> handleTranslateAudio
```

Current sequence:

1. `requireClerkSession`
2. `ensureProfileForRequest`
3. `validatePayload`
4. Run Modal Darija ASR and OpenAI STT
5. Consolidate transcripts with OpenAI
6. Translate consolidated transcript with OpenAI
7. Return the current mobile response payload

Persistent sequence:

1. Keep auth/profile/payload gates in the same order.
2. Create `translation_jobs` after payload validation and before provider calls.
3. Mark the job `running`.
4. Record provider-run rows around each provider/model operation.
5. Write `translation_results` after English translation is produced.
6. Mark the job `succeeded`.
7. If an error happens after job creation, mark the job `failed` and continue existing error handling.

Do not upload audio to Supabase Storage or dispatch Trigger.dev in Epic 02.
