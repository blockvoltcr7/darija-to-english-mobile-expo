# Definition Of Done

## Completion Criteria

- [ ] Account deletion can be initiated from inside the app by a signed-in user.
- [ ] Account deletion cleans or anonymizes app profile, translations, provider metadata, original audio, generated artifacts, and Clerk account state according to documented policy.
- [ ] Privacy Policy, Terms of Use, Data Deletion Policy, and AI Processing Disclosure are public and linked in-app.
- [ ] Fresh users must explicitly accept current AI/audio processing consent before submitting audio.
- [ ] Signup, account, translation, and history screens contain no QA-only wording in production.
- [ ] Production builds hide API URL, diagnostics, raw provider transcripts, and model metadata by default.
- [ ] Production Cloud Run API URL is created and verified.
- [ ] Production Trigger.dev worker is deployed and verified.
- [ ] Production Clerk, Supabase, Modal, and OpenAI resource decisions are documented and configured.
- [ ] Production Clerk auth methods are inventoried and Sign in with Apple requirement is either satisfied or explicitly not applicable.
- [ ] Usage controls, rate limits, and global kill switch are implemented and verified.
- [ ] App Store privacy labels are completed from a data inventory.
- [ ] iOS privacy manifest is reviewed and aligned with required API/data disclosures.
- [ ] Microphone permission copy is product-specific and verified on a clean iOS install.
- [ ] `ITSAppUsesNonExemptEncryption=false` is reviewed against actual networking/encryption behavior.
- [ ] EAS production submit strategy is documented and configured without committing Apple credentials.
- [ ] EAS Update production policy is documented, including what requires a new binary.
- [ ] iPad layout is verified because `ios.supportsTablet=true`, or tablet support is intentionally disabled before submission.
- [ ] App Store metadata includes privacy policy URL, support URL, description, screenshots, reviewer notes, and demo account.
- [ ] A production smoke test succeeds from an iOS build using production API/runtime.
- [ ] Final TestFlight/App Store Connect upload warnings are reviewed and captured as sanitized evidence.
- [ ] Release evidence is captured without secrets, private audio, or full transcripts.

## Key Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Release target | Public iOS App Store readiness, not Android. | User asked specifically about Apple/App Store readiness. |
| Runtime requirement | Production API and Trigger runtime required for public release. | Current docs explicitly mark local Trigger Development/staging path as not production-ready. |
| Data classification | Audio, transcripts, translations, and generated TTS are user data. | These can contain personal/sensitive content and are linked to Clerk user identity. |
| Account deletion | In-app initiation required. | Apple requires apps with account creation to provide account deletion initiation in app. |
| AI disclosure | Explicit consent before provider calls. | Audio/transcripts are shared with third-party AI/model providers during normal use. |
| Diagnostics | Keep for support/TestFlight, hide in production by default. | Useful for debugging but risky/noisy for public review. |
| Mobile trust boundary | Keep provider calls server-side. | Existing architecture keeps OpenAI, Modal, Supabase service-role, and Trigger secrets out of mobile. |
| PRD output path | `ai_docs/prd/app-store-release-readiness/` | Matches repo PRD structure and feeds `seed-epics`. |
