---
name: enrich-epic
description: Enrich a local epic's task specs and task-local support materials with implementation details, acceptance criteria, dependencies, file-path guidance, references, resources, and notes by cross-referencing local PRD/session docs, the codebase, and primary external docs when needed.
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

This skill enriches task specs and task-local support materials. Do not inspect, require, validate, mention, create, or update execution status files.

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

Never touch `plan.md` or `*.plan.md` files (analyze-epic owns them). Never touch `epic-overview.md` (enrichment doesn't change structure). Never delete or rewrite task support folders unless the user explicitly asks for that.

If the user is concerned about losing manual edits to a task body, the previous version is recoverable via `git log` and `git checkout` — every enrichment session creates an auto-commit.

### 5. Task support-material audit and enrichment

After the chosen task specs have been enriched, run a task-local support-material audit for each enriched task.

When subagents are available, spawn one subagent per task in parallel. Assign each subagent exactly one task folder and a disjoint write scope limited to that folder's support directories:

```text
<NN>-<slug>/references/
<NN>-<slug>/resources/
<NN>-<slug>/notes/
<NN>-<slug>/artifacts/
```

Tell each subagent:
- inspect the task's `task.md` and existing support folders;
- analyze the codebase with `rg` and direct file reads when local implementation details are needed;
- use web search only when current external product documentation is needed, and prefer official/primary docs;
- determine whether the task needs additional `references/`, `resources/`, `notes/`, or artifact templates before analysis or execution;
- add concise, source-grounded files only when they materially reduce ambiguity for a future executor;
- do not edit `task.md`, `epic-overview.md`, `plan.md`, `*.plan.md`, or any other task folder;
- do not fabricate execution evidence in `artifacts/`; real command outputs, screenshots, run IDs, deployment IDs, and blocker evidence belong to execution-time work;
- if an artifact would be useful before execution, create only a clearly labeled template or checklist.

Suggested support-file roles:
- `references/`: PRD excerpts, source-code excerpts, schema/API/config snippets, official documentation summaries, and links that anchor the task.
- `resources/`: repeatable commands, checklists, validation recipes, setup steps, and external-doc URLs needed during execution.
- `notes/`: assumptions, decisions to make, known blockers, deviation logs, ownership notes, and task-specific cautions.
- `artifacts/`: templates for future evidence only, unless the current enrichment session actually produced verifiable evidence.

If subagents are not available, do the same audit locally task by task. Keep support material concise; do not create files just to fill empty folders.

After subagents finish, merge their recommendations conservatively:
- keep task-local additions in the corresponding task folder;
- avoid duplicate reference material across tasks unless each task genuinely needs a local copy;
- prefer one focused file over many tiny files when the material belongs together;
- preserve any existing manually written support files unless the user explicitly asked to rewrite them.

### 6. Cross-check consistency

After updating task specs and support materials, do a quick pass for:
- dependency consistency
- PRD terminology drift
- missing shared-file notes
- support-file claims that are not backed by local source, PRD docs, or cited external docs
- artifact files that accidentally contain speculative execution evidence

### 7. Auto-commit and handoff

Stage the task specs and support files modified in this session and create a commit:

```bash
git add <epic_folder_path>
git commit -m "Enrich epic: <epic_name> (<N> tasks updated)"
```

Skip the commit only if no task specs or support files actually changed.

Report the enriched tasks, the support materials added, and point the user to the next analysis or execution step requested by the user.

## References

- `references/enrichment-criteria.md`
