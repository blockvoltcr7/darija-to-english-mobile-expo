# App Store Privacy Data Inventory

This inventory is the PRD source for App Store Connect privacy labels. It must be updated after implementation, before final App Store submission.

## Data Categories

| App Store Category | Collected | Linked To User | Used For Tracking | Current App Source | Purpose | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Contact Info: Email Address | Yes | Yes | No | Clerk account | App functionality, account management | Required for login, reviewer demo account, and account deletion. |
| User ID | Yes | Yes | No | Clerk user ID, profile rows | App functionality, ownership checks | Used server-side for access control. |
| Audio Data | Yes | Yes | No | Recording/upload flow, Supabase Storage | App functionality | Original audio is private user content. |
| User Content: Other User Content | Yes | Yes | No | Transcripts, translations, filenames | App functionality | Includes generated Darija transcript and English translation. |
| Diagnostics: Other Diagnostic Data | Yes | Potentially | No | API trace IDs, job IDs, Trigger run IDs, provider status | App functionality, support, diagnostics | Production UI should hide by default, but backend may retain safe identifiers. |
| Usage Data: Product Interaction | Yes | Potentially | No | Translation history, job counts, timestamps | App functionality, abuse control | Usage limits and history imply usage records. |
| Identifiers: Device ID | Review | Review | No unless SDK behavior says otherwise | Expo/Apple/runtime SDKs | Diagnostics or app functionality if collected | Confirm from final dependency/privacy manifests and App Store Connect warnings. |
| Sensitive Info | Review | Yes if present in user audio/text | No | User-provided audio and generated text | App functionality | The app does not ask for sensitive data, but user audio/transcripts can contain it. Privacy policy should warn users not to upload content they are not allowed to process. |

## Third-Party Processing

| Processor | Data Sent | Purpose | Mobile Direct Call? | PRD Requirement |
| --- | --- | --- | --- | --- |
| Clerk | Email/account/session data | Authentication and account management | Yes, via Clerk SDK for auth only | Production Clerk instance and deletion path must be verified. |
| App API / Cloud Run | Audio, filenames, session bearer token, polling requests | Server-side orchestration | Yes, app API only | Production URL must be HTTPS and smoke-tested. |
| Supabase | Audio objects, generated artifacts, profile/job/result rows | Private storage and persistence | No service-role access from mobile | Production project or isolation decision required. |
| Trigger.dev | Job IDs, stored-object references, processing state | Background translation pipeline | No | Production deployment required for public release. |
| OpenAI | Audio/transcripts/text for STT, consolidation, translation, optional TTS | AI processing | No | Privacy policy and consent must disclose provider processing. |
| Modal-hosted Darija ASR | Audio for Darija ASR | AI processing | No | Privacy policy and consent must disclose provider processing. |

## Privacy Label Review Rules

- Do not mark data as "not collected" if it is stored server-side, even when hidden from the production UI.
- Do not mark audio/transcripts as anonymous if rows or objects are linked to Clerk user identity.
- Do not mark diagnostics as unlinked unless the final logs cannot be connected to user, job, or account state.
- Do not claim tracking unless data is shared across apps/websites for advertising or data-broker purposes. The current PRD does not include advertising or tracking.
- If any analytics SDK is added later, re-open this inventory before App Store submission.

## Account Deletion Mapping

| Data | Delete / Anonymize Requirement | Verification Evidence |
| --- | --- | --- |
| Clerk account | Delete or schedule deletion through Clerk-supported server flow. | Deleted test user cannot sign back in, or scheduled deletion state is visible. |
| App profile | Soft delete or hard delete according to final policy. | Row no longer active for `clerk_user_id`. |
| Translation jobs/results | Delete or anonymize user-owned rows. | History endpoint returns no deleted-user items. |
| Original audio storage | Delete private objects or record deletion failure. | Storage lookup by old object key fails. |
| Generated TTS artifacts | Delete private objects and artifact metadata. | Playback route returns unauthorized/not found after deletion. |
| Safe audit event | Retain only minimal non-content metadata if needed. | No transcript/audio text or bytes are retained in audit row. |

## Open Questions For Release Owner

- Will production use a separate Supabase project or a shared project with strict production isolation?
- Are OpenAI and Modal production keys separate from staging keys?
- Are provider account settings compatible with the privacy policy wording about retention?
- Will support email and deletion-policy URL be hosted before the App Store submission record is filled?

