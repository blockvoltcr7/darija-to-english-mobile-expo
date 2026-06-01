# iOS Submission Evaluator Report

Date: 2026-05-24

Evaluator stance: this PRD is directionally correct, but not yet implementation-ready for App Store submission. It identifies the largest blockers, especially account deletion, privacy/legal disclosure, production runtime, and diagnostics cleanup. The remaining gaps are mostly App Store review mechanics and Expo-native release details that must be explicit before epics are generated.

## Evidence Reviewed

- `app.json`
- `eas.json`
- `package.json`
- `app/translate.tsx`
- `app/account.tsx`
- `app/signup.tsx`
- `lib/config.ts`
- `server/index.mjs`
- `trigger/translate-audio-job.mjs`
- `ai_docs/deployment/release-checklist.md`
- `ai_docs/deployment/testflight-qa-log.md`
- Expo deployment guidance for TestFlight and iOS App Store submission.
- Expo module guidance for config plugins, autolinking, and native rebuild boundaries.
- Expo UI SwiftUI guidance for SDK 55, because this app is on Expo SDK 55.
- Apple App Review Guidelines, account deletion guidance, and App Privacy Details guidance.

## Evaluation Summary

| Area | Current PRD Coverage | Evaluator Result | Required Enrichment |
| --- | --- | --- | --- |
| Account deletion | Strong | Keep | Add reviewer-visible acceptance evidence and policy-to-implementation mapping. |
| Privacy/legal | Strong but broad | Tighten | Add App Store privacy-label inventory and provider-retention caveats. |
| Production runtime | Strong | Keep | Add production Trigger proof and no-local-worker no-go gate. |
| Store metadata | Partial | Tighten | Add App Store Connect artifact checklist with owner, URL, and screenshot gates. |
| EAS submission | Partial | Tighten | Add production `submit.ios.ascAppId` / credential decision gate. |
| Native iOS permissions | Partial | Tighten | Verify microphone copy, document picker behavior, tablet support, privacy manifest, encryption export. |
| OTA updates | Missing | Add | Define EAS Update policy so production updates do not bypass App Review scope. |
| Auth review | Missing | Add | Inventory Clerk sign-in methods and decide whether Sign in with Apple is required. |
| AI output safety | Partial | Add | Add user-facing accuracy limitation and reviewer-note language. |
| SwiftUI / local modules | Missing | Add | State no native SwiftUI or local Expo module is needed unless a concrete release blocker requires it. |

## High-Severity Gaps

### 1. Clerk Auth Method Inventory

The PRD should require a release-owner inventory of enabled Clerk sign-in methods for the production instance.

If the app offers only email/password, passwordless email, or email code auth, Sign in with Apple is not automatically required by the PRD. If the app offers third-party or social login as a primary account authentication path, the release epic must evaluate Apple Sign in requirements before submission.

Acceptance evidence:

- Screenshot or written inventory of enabled production Clerk sign-in methods.
- Reviewer demo account path that does not require private phone numbers, external social accounts, or owner-only approval.
- App Review notes that explain the fastest login path.

### 2. Production Build Submit Configuration

`eas.json` has `submit.staging.ios.ascAppId` but `submit.production` is empty. That is acceptable while production is not ready, but it must be a tracked release task.

Required production decision:

- Use App Store Connect API key or interactive Apple ID flow.
- Record `ascAppId` for production submit.
- Do not commit `.p8` files or Apple credentials.
- Confirm `eas build -p ios --profile production` and `eas submit -p ios --profile production --latest` are intentionally configured.

### 3. Native iOS Privacy And Permission Review

`app.json` currently uses `expo-audio` with:

```text
Allow Darija to English to record audio.
```

That is technically present, but too generic for public review. The permission string should explain the user benefit and data use:

```text
Allow Darija to English to record audio so it can transcribe Moroccan Darija and translate it to English.
```

The PRD should also require verification for:

- Microphone permission prompt on a clean install.
- File import path through `expo-document-picker`.
- Playback path through `expo-audio`.
- Privacy manifest upload warnings from App Store Connect.
- `ITSAppUsesNonExemptEncryption=false` remains valid because the app uses standard HTTPS/TLS and does not add custom cryptography, VPN, or regulated encryption features.

### 4. EAS Update / OTA Release Policy

The app uses `expo-updates` with `runtimeVersion.policy = appVersion`. Production App Store readiness should include an OTA policy:

- EAS Update may be used for JavaScript fixes within the same reviewed app purpose.
- Do not use OTA updates to introduce new native permissions, new data collection categories, new account flows, or materially different AI behavior without a binary/App Review path.
- Every production update must record channel, runtime version, commit SHA, update ID, and rollback path.

### 5. Provider Retention And Deletion Boundary

The deletion PRD must avoid overpromising deletion from third-party AI providers if the account plan does not support provider-side deletion or zero-retention guarantees.

Required wording:

- App-owned profile, job rows, transcripts, translations, original audio objects, and generated audio artifacts are deleted or anonymized according to policy.
- Third-party processors may retain service logs or abuse-prevention records according to their terms.
- The app must disclose that audio/transcripts/translations are processed by backend AI providers.

## Medium-Severity Gaps

### App Store Screenshot And Metadata Evidence

The PRD mentions screenshots, but the epic should require screenshots from the production UI on:

- A small iPhone viewport.
- A large iPhone viewport.
- iPad or a documented decision to disable tablet support before submission.

Because `ios.supportsTablet=true`, iPad QA is not optional unless the app config changes.

### Reviewer Reliability

The TestFlight log shows queued jobs can depend on a Trigger.dev Development worker. Public App Review cannot depend on a local worker.

No-go rule:

- Do not submit for public App Review until a production Trigger deployment can complete a fresh reviewer-demo translation without a local `trigger dev` process.

### AI Translation Accuracy

The app should avoid overclaiming that translations are authoritative. Add a user-facing limitation in legal/help copy and a reviewer note:

```text
AI-generated transcripts and translations may be incomplete or imperfect and should be reviewed before relying on them.
```

### Local Expo Modules And SwiftUI

No local Expo module or `@expo/ui/swift-ui` adoption is required for App Store readiness based on the current code. If a release blocker requires native Info.plist, privacy manifest, or permission customization that Expo config cannot express, the epic should add a config plugin task rather than hand-editing generated native files.

If the app later adopts `@expo/ui/swift-ui`, the PRD must require:

- `npx expo install @expo/ui`.
- A native rebuild.
- Every SwiftUI tree wrapped in `Host`.
- `RNHostView` only when embedding React Native components inside the SwiftUI tree.
- User approval before extending missing SwiftUI views/modifiers through a local Expo module.

## Pass / Fail Judgment

Current PRD status: **not ready to seed execution epics without enrichment**.

Minimum enrichment before `seed-epics`:

- Add auth-method inventory / Sign in with Apple decision.
- Add production EAS submit configuration gate.
- Add native iOS permission, privacy manifest, and encryption-export gates.
- Add EAS Update production policy.
- Add App Store privacy-label data inventory.
- Add reviewer evidence matrix.
- Add no-local-worker production Trigger gate.

