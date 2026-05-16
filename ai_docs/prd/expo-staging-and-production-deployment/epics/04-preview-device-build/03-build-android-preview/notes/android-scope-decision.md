# Android Scope Decision

## Current Decision

- Android active for this epic run: no
- Decision owner: Codex parent session defaulted to iOS-first because user did not explicitly activate Android
- Reason: Epic scope says Android is only active when explicitly in scope; iPhone install and diagnostics should not wait on Android

## If Active

- Build profile: `preview`
- Expected artifact: APK for direct install evidence
- Device/emulator target: TBD
- Install verification needed: TBD

## If Deferred

- Deferral reason: no explicit Android activation for this run
- Does not block iPhone install: yes
- Does not block iPhone diagnostics: yes
- Next trigger for Android work: user asks to include Android preview build or release prep requires it

## Risks

- AAB is not enough for direct device/emulator install.
- EAS auth can block command execution.
- Android package must remain `com.samisabiridrissi.darijatoenglish`.
