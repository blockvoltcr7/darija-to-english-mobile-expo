---
name: seed-epic
description: Seed local epic/task folders from a PRD, implementation roadmap, or current conversation context for review before anything is finalized. Use when the user asks to seed an epic, break work into tasks, or generate local epic files.
---

# Seed Epic

Create local `epics/` artifacts that can be reviewed before the epic is finalized.

The source can be either:
- a local PRD directory, or
- the current session context when the user has already provided enough implementation detail in conversation.

## Input

Parse optional arguments:
- `prd_path`: path to the PRD directory
- `epic_root_path`: path where the generated epic package should be written
- `epic_name`: explicit epic package name

If `prd_path` is missing, do not automatically ask for it. First decide whether the current conversation contains enough source material to seed the epic safely.

Use current-session context when:
- the user explicitly asks to seed/create epics from what was discussed,
- the conversation includes the goal, architecture decisions, task boundaries, and acceptance criteria, and
- the output location can be inferred or reasonably chosen.

Ask for a PRD path only when the context is insufficient or the user specifically asks to seed from a PRD.

Default output location:
- If `prd_path` is provided: `{prd_path}/epics/`
- If using session context: `ai_docs/epics/<epic_name>/`

## Output

Write:
- one epic package folder
- one `README.md` for the epic package when multiple epic folders are created
- one subfolder per epic or phase
- one `epic-overview.md` per epic folder
- one folder per task in each epic folder
- one canonical `task.md` file in each task folder
- support folders in each task folder:
  - `artifacts/`
  - `references/`
  - `resources/`
  - `notes/`

Nothing is finalized in this stage — `finalize-epic` handles that next.

Preferred folder shape:

```text
ai_docs/epics/<epic-package>/
  README.md
  00-<epic-slug>/
    epic-overview.md
    01-<task-slug>/
      task.md
      artifacts/
      references/
      resources/
      notes/
```

Compatibility note: older epics may use flat task files like `<NN>-<slug>.md`. New seeded epics should use task folders.

## Workflow

### 1. Gather source context

If `prd_path` is provided, read `README.md`, the implementation phases page, and the other relevant PRD pages needed to understand:
- scope
- task boundaries
- dependencies
- acceptance criteria

If no `prd_path` is provided, use current-session context as the source. Extract:
- explicit user goals
- architecture decisions
- implementation constraints
- known file paths
- task boundaries
- acceptance criteria
- unresolved assumptions

When using session context, write a `README.md` in the epic package with a short `## Source Context` section that says the package was seeded from conversation context rather than a PRD.

Do not treat any roadmap as final truth. Evaluate it critically.

### 2. Restructure for execution

You may:
- split oversized tasks
- merge trivial tasks
- add missing tasks
- reorder tasks
- split or merge epics

Every structural change should have a concrete reason tied to execution quality.

Use `references/type-inference.md` to infer task types.

### 3. Present a creation plan

Before writing files, show:
- source mode: `PRD` or `current-session`
- output folder
- epic folders to be created
- tasks per epic
- major changes from the source roadmap or conversation outline
- if using session context, major assumptions and missing information
- cross-epic dependencies

Wait for confirmation before writing.

### 4. Write local epic folders

Each task folder should be self-contained enough for later enrichment and execution.

The canonical task spec is:

```text
<NN>-<slug>/task.md
```

Create these support folders even if empty:

```text
<NN>-<slug>/artifacts/
<NN>-<slug>/references/
<NN>-<slug>/resources/
<NN>-<slug>/notes/
```

`task.md` must include these sections:
- `## Type`
- `## Context`
- `## Implementation`
- `## Acceptance Criteria`
- `## Dependencies`
- `## Technical Notes`
- `## Artifact Slots`

The task should contain actionable guidance, not just a stub.

Use `## Artifact Slots` to list the kinds of supporting material expected for that task, for example:

```markdown
## Artifact Slots
- `artifacts/`: generated diagrams, screenshots, SQL drafts, API examples
- `references/`: copied source snippets, docs excerpts, design inputs
- `resources/`: helper scripts, fixtures, curl commands, sample payloads
- `notes/`: implementation notes, QA notes, blockers, decisions
```

For `## Dependencies`, use slug-based references. Cross-epic refs use `<epic-folder>/<slug>`:

```
## Dependencies
- Depends On: setup-auth
- Depends On: shared-infra-epic/provision-redis
```

For task folders, the slug is the task folder name without the numeric prefix:

```text
01-setup-auth/task.md -> setup-auth
```

### 5. Handoff

After writing files, report:
- source mode: `PRD` or `current-session`
- epic package path
- epics created
- task count
- next step: `finalize-epic <epic_folder>`

## References

- `references/type-inference.md`
