# TestFlight QA Log

Chronological notes for TestFlight runs against the staging API and Trigger.dev Development worker.

Do not record Clerk session tokens, API keys, private audio contents, full transcripts, or generated audio bytes here.

## 2026-05-23 Phone Retest

- Test start recorded: 2026-05-23 10:46 AM EDT / 2026-05-23T14:46:37Z.
- App version: 1.0.0.
- TestFlight build: 3.
- Release date: 2026-05-21.
- Tester is rerunning the audio-upload/translation flow on a physical iPhone from TestFlight.
- Previous observed failure mode: uploaded job reached `running`, OpenAI transcription and Modal Darija ASR succeeded, then Trigger.dev canceled the run with `TASK_RUN_STALLED_EXECUTING` after missing worker heartbeats during/after OpenAI consolidation.
- Evidence to append after this retest: API target, `traceId`, `jobId`, `triggerRunId`, final job status, provider-run statuses, TTS status if present, and whether English audio playback appears.

### 2026-05-23 10:46 AM EDT Retest Result

- API target: `https://darija-api-staging-nwjxqrn2ra-uc.a.run.app`.
- Initial phone diagnostics showed `traceId=upload-mpigotdt`, `jobId=625e7d5a-1236-44fb-8182-e95f1a6fb032`, and `triggerRunId=run_cmpigp1if3o960hlp7b5abrke`.
- Initial state stayed `queued` because no local Trigger.dev Development worker was running.
- Trigger worker was started locally at about 2026-05-23 10:49 AM EDT with `ENABLE_TTS=true npm run trigger:dev -- --env-file .env.local --skip-update-check`.
- The app also created a second/retry job: `traceId=upload-mpigq1pl`, `jobId=a383040f-4280-4c4c-b7a4-5531ce59a49c`, `triggerRunId=run_cmpigq4gr3iwd0uognjq52gmy`.
- Backend result for `625e7d5a-1236-44fb-8182-e95f1a6fb032`: `succeeded`; OpenAI STT, Modal Darija ASR, OpenAI consolidation, OpenAI translation, and OpenAI TTS all succeeded; English text, consolidated Darija, and English TTS artifact were present.
- Backend result for `a383040f-4280-4c4c-b7a4-5531ce59a49c`: `succeeded`; OpenAI STT, Modal Darija ASR, OpenAI consolidation, OpenAI translation, and OpenAI TTS all succeeded; English text, consolidated Darija, and English TTS artifact were present.
- App-visible result for the retry job: false timeout, `Translation job did not finish within 180 seconds.`
- Diagnosis: the backend succeeded, but the TestFlight client timed out because the 180-second polling window included the time spent queued before the local Development worker started.
- Follow-up code change in this branch: increase mobile polling timeout from 180 seconds to 420 seconds.

### 2026-05-23 Build 4 Deployment

- Git commit deployed to EAS Build: `a7583f9f94feb1cd95a3e8820412a54f35168659`.
- App version: 1.0.0.
- TestFlight build number: 4.
- EAS build ID: `3c73d1cb-a3d1-4bc7-8435-06d7ef9c6a33`.
- EAS build profile: `staging`.
- EAS channel: `staging`.
- EAS environment: `preview`.
- EAS build result: finished.
- IPA artifact: `https://expo.dev/artifacts/eas/8sXZY5nEWCGiReqdz122y8.ipa`.
- App Store Connect app ID: `6770204437`.
- EAS submission ID: `c8f5b56e-47d6-46ee-8727-e61114795c42`.
- EAS submission result: binary uploaded successfully to App Store Connect; Apple processing pending.
- TestFlight URL: `https://appstoreconnect.apple.com/apps/6770204437/testflight/ios`.

### 2026-05-23 Build 5 Deployment

- Git commit deployed to EAS Build: `e2b96cd724098959f1b2f6faa65307d6c19687e9`.
- App version: 1.0.0.
- TestFlight build number: 5.
- EAS build ID: `98c3b9e7-9e17-49e6-9b5c-8303d6b70cff`.
- EAS build profile: `staging`.
- EAS channel: `staging`.
- EAS environment: `preview`.
- EAS build result: finished at 2026-05-23T16:07:03Z.
- App Store Connect app ID: `6770204437`.
- EAS submission ID: `3cbcc03a-948a-42d8-a589-68b8b8930df8`.
- EAS submission result: binary uploaded successfully to App Store Connect; Apple processing pending.
- TestFlight URL: `https://appstoreconnect.apple.com/apps/6770204437/testflight/ios`.
- Note: the first auto-submit scheduling attempt failed because `--what-to-test` maps to the EAS changelog field, which requires an Enterprise Expo plan. The same finished build was submitted successfully without the changelog field.

### 2026-05-24 Build 6 Deployment

- Git commit deployed to EAS Build: `7f07420`.
- App version: 1.0.0.
- TestFlight build number: 6.
- EAS build ID: `dcf1f6b3-d75b-4349-b58e-0e0a8acc41d9`.
- EAS build profile: `staging`.
- EAS channel: `staging`.
- EAS environment: `preview`.
- EAS build result: finished.
- IPA artifact: `https://expo.dev/artifacts/eas/thqRMGSQ7KF1ts7wFozfqa.ipa`.
- App Store Connect app ID: `6770204437`.
- EAS submission ID: `7b714436-1084-436a-ae2d-cac2b07e1c19`.
- EAS submission result: binary uploaded successfully to App Store Connect; Apple processing pending.
- TestFlight URL: `https://appstoreconnect.apple.com/apps/6770204437/testflight/ios`.
- Focus: verify English translation no longer includes literal `[unclear]` for nonessential uncertain spans, and generated English TTS does not say "unclear".
