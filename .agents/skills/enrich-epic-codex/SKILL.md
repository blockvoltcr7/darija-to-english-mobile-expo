---
name: enrich-epic
description: Enrich a local epic's task specs with implementation details, acceptance criteria, dependencies, and file-path guidance by cross-referencing local PRD/session docs and the codebase. Run after seed-epic and before finalize-epic/analyze-epic.
---

# Enrich Epic

Upgrade local task specs from roadmap-level descriptions into implementation-ready task specs.

Preferred task shape:

```text
<epic_folder>/<NN>-<slug>/task.md
```

Legacy task shape is still accepted:

```text
<epic_folder>/<NN>-<slug>.md
```

## Input

Parse one argument:
- `epic_folder_path`: path to the epic folder

If it is missing, ask for it.

Do not require `status.log`. Enrichment is allowed before finalization because this skill improves draft task specs before the task set is frozen for analysis and execution.

If `status.log` exists, treat it as append-only execution state and do not edit it. If `status.log` is missing, mention that this is expected for a pre-finalized epic and that `finalize-epic <epic_folder_path>` should run after enrichment.

## Workflow

### 1. Load task and source context

Discover tasks in this order:
- Preferred: glob `<epic_folder_path>/<NN>-<slug>/task.md`
- Legacy: glob `<epic_folder_path>/*.md`, excluding `epic-overview.md` and `*.plan.md`

If both shapes exist for the same slug, use the folder task and warn about the legacy duplicate.

Read each task spec. Also inspect task-local support folders when present:
- `references/`
- `resources/`
- `notes/`
- `artifacts/`

Read the relevant local PRD docs or epic-package `README.md` files that define:
- feature scope
- data model
- architecture
- definition of done

Local PRD docs are the primary source of truth when present. If the epic was seeded from current-session context, the epic package `README.md`, `epic-overview.md`, and task-local `references/`/`notes/` folders become the source context.

### 2. Score task quality

Evaluate each task with `references/enrichment-criteria.md` and classify it as:
- Critical
- Needs Enrichment
- Adequate

### 3. Present the assessment

Show the quality table and ask whether to enrich all tasks or a selected subset.

### 4. Enrich the chosen tasks

For each chosen task, rewrite the task spec body wholesale (replace, not merge). For folder-shaped tasks, rewrite only:

```text
<NN>-<slug>/task.md
```

The new body must include:
- `## Type`
- `## Context`
- `## Implementation`
- `## Acceptance Criteria`
- `## Dependencies`
- `## Technical Notes`
- `## Artifact Slots`

Keep `## Implementation` concise and directive. It should point the executor to the right files and patterns, not contain the full implementation.

Never touch `plan.md` or `*.plan.md` files (analyze-epic owns them). Never touch `status.log` if it already exists. Never touch `epic-overview.md` (enrichment doesn't change structure). Never delete or rewrite task support folders unless the user explicitly asks for that.

If the user is concerned about losing manual edits to a task body, the previous version is recoverable via `git log` and `git checkout` — every enrichment session creates an auto-commit.

### 5. Cross-check consistency

After updating tasks, do a quick pass for:
- dependency consistency
- PRD terminology drift
- missing shared-file notes

### 6. Auto-commit and handoff

Stage the spec files modified in this session and create a commit:

```bash
git add <epic_folder_path>
git commit -m "Enrich epic: <epic_name> (<N> tasks updated)"
```

Skip the commit only if no spec files actually changed.

Report the enriched tasks and point the user to:
- `finalize-epic <epic_folder_path>` if the epic has not been finalized yet
- `analyze-epic <epic_folder_path>` after finalization

## References

- `references/enrichment-criteria.md`
