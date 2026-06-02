# Copy And State Decisions

## Copy Constraints

- Use release-ready user language, not QA wording or database terms.
- Describe categories, not internal storage structures: account, saved translation history, original audio, generated audio, and app-owned processing records.
- Do not promise deletion from OpenAI, Modal, Clerk, Supabase, Trigger.dev, or infrastructure logs beyond what the final policy/API can prove.
- Tell users if deletion is scheduled or requires more time; do not imply completion when the server returns a non-completed state.

## Response-State Assumptions

The UI should be ready for these safe server states from `DELETE /v1/account`:

- `completed`: app-owned cleanup and account deletion reached the accepted final state.
- `scheduled`: cleanup or Clerk deletion is queued/manual but accepted by policy.
- `reauthentication_required`: the user must reauthenticate before the destructive operation can continue.
- `partial_failure`: some app-owned cleanup failed and requires retry/support handling.
- `failed`: unexpected failure; show a safe retry/support message.

## Open Decisions For Execution

- Whether confirmation is typed text, a second destructive alert, or a dedicated confirmation screen.
- Whether successful/scheduled deletion should call Clerk `signOut()` immediately or show one completion screen before routing to `/login`.
- The final support contact and legal/privacy links should come from Epic 01 legal-surface work, not hard-coded placeholder copy.
