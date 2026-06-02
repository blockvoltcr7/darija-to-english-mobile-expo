# Technical Specifications

## Release Environment Contract

Add a production-safe app environment contract.

Suggested public env names:

```text
EXPO_PUBLIC_API_BASE_URL=https://<production-api-url>
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<production publishable key>
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_ENABLE_DIAGNOSTICS=false
EXPO_PUBLIC_LEGAL_PRIVACY_URL=https://<public-host>/privacy
EXPO_PUBLIC_LEGAL_TERMS_URL=https://<public-host>/terms
EXPO_PUBLIC_LEGAL_DELETE_ACCOUNT_URL=https://<public-host>/delete-account
EXPO_PUBLIC_AI_CONSENT_VERSION=2026-05-24
EXPO_PUBLIC_OTA_UPDATE_POLICY_VERSION=2026-05-24
```

Server-only names stay outside EAS public env:

```text
CLERK_SECRET_KEY
CLERK_WEBHOOK_SIGNING_SECRET
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
DARIJA_ASR_API_KEY
TRIGGER_SECRET_KEY
```

## Account Deletion API

Preferred endpoint:

```http
DELETE /v1/account
Authorization: Bearer <Clerk session token>
Content-Type: application/json
```

Request:

```json
{
  "confirmation": "DELETE",
  "reason": "optional free-form user reason",
  "deleteAudioAndArtifacts": true
}
```

Success response:

```json
{
  "status": "scheduled",
  "profileDeleted": true,
  "translationJobsDeleted": 12,
  "audioObjectsDeleted": 12,
  "artifactObjectsDeleted": 8,
  "clerkAccountDeletion": "scheduled",
  "traceId": "account-delete-..."
}
```

Error response:

```json
{
  "error": "Account deletion failed.",
  "reason": "reauthentication_required",
  "traceId": "account-delete-..."
}
```

Implementation notes:

- Require Clerk session authentication.
- Do not accept a `clerk_user_id` from the client; derive it from the verified session.
- Soft delete or hard delete according to the final policy decision, but Apple-facing language must match implementation.
- Delete private Supabase Storage objects through Storage API helpers, not SQL-only row deletion.
- Keep an audit-safe deletion event that does not preserve private transcript/audio content.

## AI Processing Consent

Persist consent by Clerk user ID.

Suggested table:

```sql
create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  consent_type text not null,
  version text not null,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  source text not null default 'ios_app',
  unique (clerk_user_id, consent_type, version)
);
```

Suggested consent types:

```text
third_party_ai_audio_processing
privacy_policy
terms_of_use
```

Client behavior:

- If required consent is missing or outdated, show blocking consent before upload/record submission.
- Consent copy must identify the categories of data sent: audio file, generated transcripts, generated translations, model metadata, and generated English audio where applicable.
- Consent copy must identify third-party AI/model providers at least by category and preferably by provider names used in the app: OpenAI and Modal-hosted Darija ASR.

## Usage And Abuse Controls

Before provider calls:

- Check global kill switch.
- Check per-user daily/monthly job limit.
- Check per-IP burst limit.
- Check max audio duration/size.
- Record usage reservation before paid model calls.

Suggested server response for quota:

```json
{
  "error": "Usage limit reached.",
  "reason": "daily_user_limit_exceeded",
  "retryAfterSeconds": 86400,
  "traceId": "..."
}
```

## Production UI Flags

Suggested config shape in `lib/config.ts`:

```ts
export const CONFIG = {
  API_BASE_URL,
  APP_ENV,
  IS_PRODUCTION: APP_ENV === 'production',
  ENABLE_DIAGNOSTICS: readBoolean('EXPO_PUBLIC_ENABLE_DIAGNOSTICS', false),
  LEGAL_URLS: {
    privacy: process.env.EXPO_PUBLIC_LEGAL_PRIVACY_URL,
    terms: process.env.EXPO_PUBLIC_LEGAL_TERMS_URL,
    deleteAccount: process.env.EXPO_PUBLIC_LEGAL_DELETE_ACCOUNT_URL,
  },
  AI_CONSENT_VERSION: process.env.EXPO_PUBLIC_AI_CONSENT_VERSION,
};
```

Production hiding rules:

- Hide API base URL chips.
- Hide diagnostics panel by default.
- Hide raw provider transcripts by default.
- Hide model/provider metadata by default.
- Keep copy/share support for result text if already user-facing.

## App Store Privacy Labels Data Inventory

Expected data categories to review in App Store Connect:

| Data Category | Likely Collected | Linked To User | Notes |
| --- | --- | --- | --- |
| Contact Info | Yes | Yes | Email and account profile through Clerk. |
| User ID | Yes | Yes | Clerk user ID and app profile ownership key. |
| Audio Data | Yes | Yes | User-recorded/uploaded voice/audio. |
| Other User Content | Yes | Yes | Transcripts, translations, filenames. |
| Diagnostics | Yes | Potentially | Trace IDs, job IDs, provider status, errors. |
| Usage Data | Yes | Potentially | History, job counts, provider run metadata. |
| Sensitive Info | Review | Review | Audio/transcripts may contain sensitive content depending on user input. |

The detailed source of truth is [App Store Privacy Data Inventory](./12-app-store-privacy-data-inventory.md).

## iOS Native Release Contract

Required `app.json` review points:

- `ios.bundleIdentifier` matches the App Store Connect app record.
- `ios.appleTeamId` matches the submitting Apple Developer team.
- `ios.infoPlist.ITSAppUsesNonExemptEncryption=false` is still accurate for standard HTTPS/TLS-only networking.
- `ios.supportsTablet=true` is intentionally supported and verified on iPad, or changed before submission.
- `expo-audio.microphonePermission` is user-facing and explains recording for Darija transcription/English translation.
- `runtimeVersion.policy = appVersion` remains compatible with the production EAS Update policy.

Required `eas.json` review points:

- Production build uses `environment=production` and `channel=production`.
- Production submit has an explicit iOS App Store Connect strategy.
- Credentials are managed through EAS/Apple secure flows, not committed to the repo.

## EAS Update Production Policy

Allowed through EAS Update:

- JavaScript-only bug fixes.
- Copy fixes that do not change legal/privacy meaning.
- UI fixes within the existing reviewed feature set.

Requires new binary and review decision:

- New native dependency or config plugin.
- New iOS permission or changed permission usage.
- New data collection category.
- New auth provider or account lifecycle behavior.
- Material AI pipeline behavior change.
- Runtime version change.

Every production update must record:

- Channel.
- Runtime version.
- Commit SHA.
- Update ID.
- Rollback command or rollback decision.

## Expo Module And SwiftUI Boundary

No local Expo module is required for the current PRD. If native iOS configuration cannot be expressed in `app.json` or an existing Expo config plugin, use a small local config plugin and verify it with prebuild/build output.

No `@expo/ui/swift-ui` dependency is required for App Store readiness. If introduced later on Expo SDK 55:

- Install with `npx expo install @expo/ui`.
- Rebuild the native app.
- Wrap every SwiftUI tree in `Host`.
- Use `RNHostView` only for embedding React Native components inside SwiftUI.
- Confirm with the user before extending missing SwiftUI views/modifiers through a local Expo module.
