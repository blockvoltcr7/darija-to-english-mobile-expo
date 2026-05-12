# Dependency Preflight And Blockers

## Before Running Task 04

Task 04 should fail fast unless these are true:

- [ ] Task 02 created root `eas.json`.
- [ ] Task 03 created or updated `ai_docs/deployment/README.md` with app identity.
- [ ] `app.json` still has the expected iOS bundle ID and Android package.
- [ ] Any Task 02 staging environment deviation is recorded in `../02-create-eas-build-profiles/notes/profile-deviations.md`.

## Known Current Blocker Before Task Execution

At the time this note was written, root `eas.json` did not exist yet. That is expected before Task 02 runs and should not be treated as a Task 04 failure until Task 04 is actually executed out of order.

## Blocker Handling

Record blockers precisely:

- Missing file blocker: name the missing file and dependency task.
- EAS auth blocker: paste sanitized CLI message and required account action.
- Apple/Google blocker: state which external portal/action is required.
- Static check blocker: include command, exit status, and responsible file area.

Do not mark Task 04 complete with unresolved blockers.
