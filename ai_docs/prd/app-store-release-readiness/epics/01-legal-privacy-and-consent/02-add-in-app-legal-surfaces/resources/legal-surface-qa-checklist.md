# Legal Surface QA Checklist

- [ ] Start signed in and open Account.
- [ ] Confirm the Account screen includes a Legal or Privacy/Data entry.
- [ ] Open the legal screen and confirm Privacy Policy, Terms of Use, Data Deletion Policy, AI Processing Disclosure, and Support are visible.
- [ ] Tap each configured link and confirm it opens a public page.
- [ ] Temporarily run with one required legal URL missing and confirm the app shows a visible release-prep warning.
- [ ] Confirm the screen does not display API base URLs, provider model names, Trigger run IDs, internal diagnostics, or secrets.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
