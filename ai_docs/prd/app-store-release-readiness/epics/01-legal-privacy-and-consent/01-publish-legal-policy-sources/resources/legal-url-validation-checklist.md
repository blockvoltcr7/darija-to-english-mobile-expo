# Legal URL Validation Checklist

Use this during execution after candidate policy/support URLs exist.

- [ ] Privacy Policy URL opens without authentication in Safari or an in-app browser.
- [ ] Terms of Use URL opens without authentication.
- [ ] Data Deletion Policy URL opens without authentication and explains in-app deletion initiation.
- [ ] AI Processing Disclosure URL opens without authentication and identifies backend AI/provider processing.
- [ ] Support URL or support email page opens without authentication and gives a usable contact path.
- [ ] Each URL uses HTTPS unless the release owner explicitly approves a temporary blocker state.
- [ ] Policy text mentions audio, transcripts, translations, generated English audio when enabled, diagnostics, usage records, Clerk identity, Supabase storage/data, Trigger.dev jobs, OpenAI, and Modal-hosted Darija ASR.
- [ ] Policy text avoids secrets, internal account IDs, private audio contents, full transcripts, provider keys, and exact `.env` values.
- [ ] Any missing URL is recorded as an Epic 05 blocker, not hidden.
