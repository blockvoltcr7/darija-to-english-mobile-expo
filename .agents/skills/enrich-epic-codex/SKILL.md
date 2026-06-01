---
name: enrich-epic
description: Enrich a local epic's task specs, task-local support materials, and bounded overview summary with implementation details, acceptance criteria, dependencies, file-path guidance, references, resources, and notes by cross-referencing local PRD/session docs, the codebase, and primary external docs when needed.
---

# Enrich Epic

Upgrade local task specs from roadmap-level descriptions into implementation-ready task specs, then refresh the epic overview summary so it matches the enriched task set.

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

This skill enriches task specs, task-local support materials, and the enrichment-owned overview block. Do not inspect, require, validate, mention, create, or update execution status files.

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

Show the quality table, then proceed directly without asking for approval.

Enrich every task classified as:
- Critical
- Needs Enrichment

Leave `Adequate` tasks unchanged unless the user explicitly requested all tasks, named a subset that includes them, or a minimal update is required to keep the refreshed `epic-overview.md` consistent with the enriched task set.

If the user explicitly named a subset of tasks in the original request, use that subset without asking for confirmation. Do not pause to ask whether to enrich the epic after the assessment.

### 4. Research tasks that need enrichment and support needs

Before rewriting task specs, research what each task selected by Step 3 needs. The research pass should identify task-spec gaps, relevant code paths, dependencies, acceptance criteria, and useful task-local support materials.

Default local mode:
- The parent session audits task-local support needs task by task.
- The parent session gathers enough source-grounded detail to rewrite `task.md` and create only support files that materially reduce execution ambiguity.

Explicit subagent mode:
- Use subagents only when the user explicitly asks for subagents, parallel research, or batched research.
- Subagents are read-only researchers. They inspect, analyze, and report; they do not edit or create files.
- For small task sets selected by Step 3, the parent may wait for all research reports before writing.
- For large task sets selected by Step 3, process tasks in batches of 3-5. The parent may write task-local updates as each report returns, but refreshes `epic-overview.md` and commits only after the batch is complete.

Give each read-only subagent exactly one task folder to research.

Tell each subagent:
- inspect the task's `task.md` and existing support folders;
- inspect relevant PRD/source docs, epic package README files, and `epic-overview.md` for source context;
- analyze the current codebase with `rg` and direct file reads when local implementation details are needed;
- use web search only when current external product documentation is needed, and prefer official/primary docs;
- determine what the parent should change in `task.md` and whether the task needs additional `references/`, `resources/`, `notes/`, or template-only `artifacts/` before analysis or execution;
- return a compact, source-grounded enrichment report;
- do not edit files;
- do not create files;
- do not update `task.md`, `epic-overview.md`, `plan.md`, `*.plan.md`, `status.log`, or any support folder;
- do not fabricate execution evidence; real command outputs, screenshots, run IDs, deployment IDs, and blocker evidence belong to execution-time work.

Required subagent report shape:

```markdown
## Research Report: <slug>

### Current Task Gaps
- ...

### Recommended task.md Updates
- Context:
- Implementation:
- Acceptance Criteria:
- Dependencies:
- Technical Notes:
- Artifact Slots:

### Source-Grounded References
- `<path>`: why it matters

### Support Files Recommended
- `references/<name>.md`: purpose
- `resources/<name>.md`: purpose
- `notes/<name>.md`: purpose
- `artifacts/<name>.md`: template/checklist purpose only

### Risks Or Unknowns
- ...
```

Keep subagent reports compact:
- maximum 5 current task gaps;
- maximum 10 source-grounded references;
- maximum 5 acceptance criteria suggestions;
- maximum 3 support files recommended unless the task clearly needs more;
- maximum 5 risks or unknowns.

Suggested support-file roles:
- `references/`: PRD excerpts, source-code excerpts, schema/API/config snippets, official documentation summaries, and links that anchor the task.
- `resources/`: repeatable commands, checklists, validation recipes, setup steps, and external-doc URLs needed during execution.
- `notes/`: assumptions, decisions to make, known blockers, deviation logs, ownership notes, and task-specific cautions.
- `artifacts/`: templates for future evidence only, unless the current enrichment session actually produced verifiable evidence.

Parent writeback rules:
- The parent session is the only writer for `task.md`, `epic-overview.md`, task-local support folders, and the enrichment commit.
- In subagent mode, use reports as recommendations, not as content to paste blindly.
- Keep support material concise; do not create files just to fill empty folders.
- Keep task-local additions in the corresponding task folder.
- Avoid duplicate reference material across tasks unless each task genuinely needs a local copy.
- Prefer one focused file over many tiny files when the material belongs together.
- Preserve any existing manually written support files unless the user explicitly asked to rewrite them.

### 5. Enrich the tasks that need it

After local research or subagent reports are complete for the current task or batch, the parent session rewrites each task spec selected by Step 3 wholesale (replace, not merge). For folder-shaped tasks, rewrite only:

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

The parent session may also create or update task-local support files based on the research pass. Do not create support files just because the folders exist.

Never touch `plan.md` or `*.plan.md` files (analyze-epic owns them). When updating `epic-overview.md`, only update the enrichment-owned block described in Step 6 and never touch the status table block. Never delete or rewrite task support folders unless the user explicitly asks for that.

If the user is concerned about losing manual edits to a task body, the previous version is recoverable via `git log` and `git checkout` — every enrichment session creates an auto-commit.

### 6. Refresh the epic overview

After task specs and support materials have been enriched, refresh `epic-overview.md` so it summarizes the current enriched task set.

Only write inside this bounded block:

```markdown
<!-- ENRICHED-OVERVIEW-START -->
## Enriched Overview

### Scope
...

### Task Summary
| # | Slug | Type | Summary | Key Dependencies |
|---|---|---|---|---|

### Execution Notes
...
<!-- ENRICHED-OVERVIEW-END -->
```

If the markers are present, replace only the content between them. If the markers are missing, append the block before `<!-- STATUS-TABLE-START -->` when that marker exists, otherwise append it to the end of `epic-overview.md`.

The refreshed overview should include:
- a concise scope summary derived from the enriched task specs and source context;
- one row per task with slug, type, implementation summary, and key dependencies;
- notable shared-file or sequencing notes that `prepare-epic` and `analyze-epic` should preserve;
- unresolved assumptions or decisions that remain after enrichment.

Do not update or rewrite:
- `<!-- STATUS-TABLE-START -->` to `<!-- STATUS-TABLE-END -->` (owned by `prepare-epic` and `run-epic-codex`);
- execution plan summaries from `plan.md` files (owned by `analyze-epic`);
- historical execution evidence in task `artifacts/`.

Subagents must not edit `epic-overview.md`; the parent session owns this refresh after integrating subagent output.

### 7. Cross-check consistency

After updating task specs, support materials, and the overview block, do a quick pass for:
- dependency consistency
- PRD terminology drift
- `epic-overview.md` claims that do not match enriched task specs
- missing shared-file notes
- support-file claims that are not backed by local source, PRD docs, or cited external docs
- artifact files that accidentally contain speculative execution evidence

### 8. Auto-commit and handoff

Stage the task specs, support files, and `epic-overview.md` modifications from this session and create a commit:

```bash
git add <epic_folder_path>
git commit -m "Enrich epic: <epic_name> (<N> tasks updated)"
```

Skip the commit only if no task specs, support files, or overview content actually changed.

Report the enriched tasks, the support materials added, whether the overview block was refreshed, and point the user to the next analysis or execution step requested by the user.

## References

- `references/enrichment-criteria.md`
