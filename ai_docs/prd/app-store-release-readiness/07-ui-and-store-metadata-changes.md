# UI And Store Metadata Changes

## Landing And Auth

### Current

`app/index.tsx` presents the app and routes to account creation/sign-in. `app/signup.tsx` includes QA-oriented copy:

```text
Set up access for saved translations and fresh-user QA.
```

### Target

Replace QA copy with user-facing release copy:

```text
Create an account to save translations, review history, and manage your data.
```

Signup must include:

- Privacy Policy link.
- Terms of Use link.
- AI/audio processing disclosure link.
- Explicit acknowledgement that uploaded/recorded audio is sent to backend services and third-party AI providers for transcription, translation, and optional speech generation.
- Clear limitation copy that AI-generated transcripts and translations may be incomplete or imperfect.

## Translation Screen

### Current

`app/translate.tsx` exposes:

- API target and URL.
- Diagnostics panel.
- Raw OpenAI transcript.
- Raw Darija model transcript.
- Model metadata.

### Target

Production default:

- Show record/upload.
- Show English translation.
- Show consolidated Darija transcript.
- Show English audio playback when available.
- Hide API URL, diagnostics, raw provider transcripts, and model metadata.

Debug/support mode:

- Preserve current diagnostics and raw/provider details when `EXPO_PUBLIC_ENABLE_DIAGNOSTICS=true`.

## Account Screen

### Current

`app/account.tsx` exposes profile, security, history, and sign out.

### Target

Add:

- Privacy and data
- Legal
- Delete account

Delete flow:

1. Tap Account.
2. Tap Privacy and data.
3. Tap Delete account.
4. Read consequence summary.
5. Confirm with destructive action.
6. Re-authenticate if required.
7. Server performs deletion.
8. App signs out and shows completion.

## History Screen

### Current

`app/history.tsx` exposes provider operation names/statuses in detail view.

### Target

Production default:

- Show translation, Darija transcript, file/date, and TTS playback.
- Hide provider operation list unless diagnostics/support mode is enabled.

## App Store Connect Metadata

Required before submission:

- App name: `Darija to English`
- Subtitle: concise translation-focused phrase within Apple limits.
- Description: explain audio translation, account history, privacy posture, and AI processing.
- Keywords: Darija, Moroccan Arabic, translation, transcription, audio, English.
- Privacy policy URL.
- Support URL.
- App Review notes with demo account and one-sentence test path.
- Data privacy questionnaire matching actual data flows.
- Screenshots that show the release UI, not diagnostics or QA copy.
- Screenshot set from small iPhone, large iPhone, and iPad if `supportsTablet=true`.
- Production Clerk auth-method summary and reviewer-safe login path.

Recommended reviewer note:

```text
Demo account:
Email: <reviewer-demo-email>
Password: <reviewer-demo-password>

Test path:
Sign in, tap Upload Audio or Record, submit a short Moroccan Darija audio sample, wait for English translation and optional English audio playback. The backend may take up to 7 minutes for longer audio.

The app processes user audio on the server using third-party AI providers for transcription, translation, and optional speech generation. Consent and privacy disclosures are available in-app under Account -> Legal and during first audio submission.

AI-generated transcripts and translations may be incomplete or imperfect. The demo audio should be short and non-sensitive.
```
