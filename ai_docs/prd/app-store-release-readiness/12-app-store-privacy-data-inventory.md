# App Store Privacy Data Inventory

This inventory is the PRD source for App Store Connect privacy labels. It must be updated after implementation, before final App Store submission.

## Public Policy URLs

| Surface | URL | Status |
| --- | --- | --- |
| Privacy Policy | https://darija-to-english-legal.pages.dev/privacy | Hosted on Cloudflare Pages. |
| Terms of Use | https://darija-to-english-legal.pages.dev/terms | Hosted on Cloudflare Pages. |
| AI Processing Disclosure | https://darija-to-english-legal.pages.dev/ai-processing | Hosted on Cloudflare Pages. |
| Data Deletion Policy | https://darija-to-english-legal.pages.dev/data-deletion | Hosted on Cloudflare Pages. |
| Support | https://darija-to-english-legal.pages.dev/support | Hosted on Cloudflare Pages. |

## Production Release Gate Status

| Gate | Status |
| --- | --- |
| App Store privacy labels match the real data inventory. | Repository source of truth is implemented in this inventory; App Store Connect entry/publish remains a release-owner action. |
| Account deletion is easy for reviewers to find and test. | Implemented through Account > Delete account and authenticated `DELETE /v1/account`; still needs disposable-account QA evidence before submission. |
| Consent withdrawal blocks new AI processing. | Implemented through Account > Withdraw AI consent plus server/Convex `consent_required` enforcement. |
| Support page includes fuller business/contact identity. | MVP contact identity is hosted: app name, developer/operator name, support email, privacy/deletion request instructions. Confirm postal address/phone/company details if target regions require them. |
| Retention copy stays conservative. | Implemented: policies say app-side ephemeral default and disclose provider-side logs/backups/security/legal retention limits. |

## Data Categories

| App Store Category | Collected | Linked To User | Used For Tracking | Current App Source | Purpose | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Contact Info: Email Address | Yes | Yes | No | Clerk account | App functionality, account management | Required for login, reviewer demo account, and account deletion. |
| User ID | Yes | Yes | No | Clerk user ID, profile rows | App functionality, ownership checks | Used server-side for access control. |
| Audio Data | Yes | Yes | No | Recording/upload flow, Convex Storage during processing | App functionality | Original voice recordings are deleted after processing; saved history stores outputs only. |
| User Content: Other User Content | Yes | Yes | No | Transcripts, translations, filenames, generated audio outputs | App functionality | Default processing is ephemeral. Saved history is opt-in and stores outputs only. |
| Diagnostics: Other Diagnostic Data | Yes | Potentially | No | API trace IDs, job IDs, Trigger run IDs, provider status | App functionality, support, diagnostics | Production UI should hide by default, but backend may retain safe identifiers. |
| Usage Data: Product Interaction | Yes | Potentially | No | Translation history, job counts, timestamps | App functionality, abuse control | Usage limits and history imply usage records. |
| Identifiers: Device ID | Review | Review | No unless SDK behavior says otherwise | Expo/Apple/runtime SDKs | Diagnostics or app functionality if collected | Confirm from final dependency/privacy manifests and App Store Connect warnings. |
| Sensitive Info | Review | Yes if present in user audio/text | No | User-provided audio and generated text | App functionality | The app does not ask for sensitive data, but user audio/transcripts can contain it. Privacy policy should warn users not to upload content they are not allowed to process. |

## Third-Party Processing

| Processor | Data Sent | Purpose | Mobile Direct Call? | PRD Requirement |
| --- | --- | --- | --- | --- |
| Clerk | Email/account/session data | Authentication and account management | Yes, via Clerk SDK for auth only | Production Clerk instance and deletion path must be verified. |
| App API / Cloud Run | Audio, filenames, session bearer token, polling requests | Server-side orchestration | Yes, app API only | Production URL must be HTTPS and smoke-tested. |
| Convex | Consent proof, profile rows, processing state, temporary audio objects, saved output history | Private storage and persistence | No server-secret access from mobile | Production deployment, consent audit, and retention behavior must be verified. |
| Trigger.dev | Job IDs, stored-object references, processing state | Background translation pipeline | No | Production deployment required for public release. |
| OpenAI | Audio/transcripts/text for STT, consolidation, translation, optional TTS | AI processing | No | Privacy policy and consent must disclose provider processing. |
| Modal-hosted Darija ASR | Audio for Darija ASR | AI processing | No | Privacy policy and consent must disclose provider processing. |

## Privacy Label Review Rules

- Do not mark data as "not collected" if it is processed server-side, temporarily stored, or saved by user choice.
- Do not mark audio/transcripts as anonymous if rows or objects are linked to Clerk user identity.
- Do not mark diagnostics as unlinked unless the final logs cannot be connected to user, job, or account state.
- Do not claim tracking unless data is shared across apps/websites for advertising or data-broker purposes. The current PRD does not include advertising or tracking.
- If any analytics SDK is added later, re-open this inventory before App Store submission.

## Account Deletion Mapping

| Data | Delete / Anonymize Requirement | Verification Evidence |
| --- | --- | --- |
| Clerk account | Delete or schedule deletion through Clerk-supported server flow. | Deleted test user cannot sign back in, or scheduled deletion state is visible. |
| App profile | Hard delete through `DELETE /v1/account` after authenticated Clerk session. | Row no longer active for `clerk_user_id`. |
| Translation jobs/results | Delete user-owned rows through `convex/accountDeletion.ts`; saved history is removed from active app storage. | History endpoint returns no deleted-user items. |
| Original audio storage | Delete private objects or record deletion failure. | Storage lookup by old object key fails. |
| Generated TTS artifacts | Delete private objects and artifact metadata. | Playback route returns unauthorized/not found after deletion. |
| Safe audit event | Retain only anonymized consent proof and sanitized webhook metadata if needed. | No transcript/audio text, generated content, email, display name, raw Clerk ID, or audio bytes are retained in audit row. |

## Open Questions For Release Owner

- Will production use a separate Convex deployment or the current development deployment promoted with strict production isolation?
- Are OpenAI and Modal production keys separate from staging keys?
- Are provider account settings compatible with the privacy policy wording about retention?
- Does final legal review require custom domain URLs instead of the current Cloudflare Pages URL?
