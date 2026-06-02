# Diagnostics Visibility Checklist

Run this in execution after Task 01 config flags exist.

## Production Default

Set:

```bash
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_ENABLE_DIAGNOSTICS=false
```

Verify:

- [ ] Translate header does not show API target label or API base URL.
- [ ] Translate screen does not show diagnostics event list.
- [ ] Translate result shows English translation, consolidated Darija, and English playback when available.
- [ ] Translate result does not show raw OpenAI transcript, raw Darija transcript, model names, trace IDs, job IDs, or Trigger run IDs.
- [ ] History list does not show model names.
- [ ] History detail does not show provider operation rows.

## Support/Diagnostics Mode

Set:

```bash
EXPO_PUBLIC_ENABLE_DIAGNOSTICS=true
```

Verify:

- [ ] API target and URL visibility is restored for QA/support builds.
- [ ] Diagnostics include safe events such as health status, job status, and trigger run ID.
- [ ] Raw provider transcript and model metadata visibility is restored only for signed-in authorized data.
- [ ] No Clerk session token, API key, `.env` value, private audio byte content, or full transcript is copied into docs.

## Regression Checks

- [ ] Recording path still submits and polls.
- [ ] Upload path still submits and polls.
- [ ] Recoverable queued job can still resume.
- [ ] TTS playback remains visible and authenticated.
