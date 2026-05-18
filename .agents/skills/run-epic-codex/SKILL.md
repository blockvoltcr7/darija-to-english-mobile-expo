---
name: run-epic-codex
description: Execute an analyzed local epic folder phase by phase in Codex using task specs, plan files, status.log, and explicit Codex subagent spawning for parallel-safe work. Use when the user asks Codex to run or execute an epic pipeline with subagents.
---

# Run Epic Codex

Execute a prepared and analyzed local epic folder using enriched task specs, `status.log` initialized by `prepare-epic`, and execution strategy plans produced by `analyze-epic`. The epic's append-only `status.log` is the source of truth, and the parent Codex session is the only writer.

Preferred task shape:

```text
<epic_folder>/<NN>-<slug>/task.md
<epic_folder>/<NN>-<slug>/plan.md
<epic_folder>/<NN>-<slug>/artifacts/
<epic_folder>/<NN>-<slug>/references/
<epic_folder>/<NN>-<slug>/resources/
<epic_folder>/<NN>-<slug>/notes/
```

Legacy task shape is still accepted:

```text
<epic_folder>/<NN>-<slug>.md
<epic_folder>/<NN>-<slug>.plan.md
```

This is the Codex-native execution entrypoint for the epic pipeline. It keeps the workflow skill-first: custom agents may help later, but this skill remains the source of truth.

## Input

Parse one argument:

- `epic_folder_path`: path to the analyzed epic folder

If it is missing, ask for it.

Refuse to run if `status.log` is not present. Tell the user to run `prepare-epic <epic_folder_path>` first.

Refuse to run if any open task is missing its plan file. Tell the user to run `analyze-epic <epic_folder_path>` first.

## Codex orchestration model

Use Codex's parent-session orchestration model.

- The parent Codex session owns the phase plan, status.log writes, integration decisions, and phase gates.
- The parent may execute sequential work directly.
- The parent may spawn Codex subagents for parallel-safe work when the user has explicitly asked for Codex subagent or parallel-agent execution.
- Prefer `worker` subagents for bounded implementation slices and `explorer` subagents for read-heavy mapping or verification.
- Keep delegated write scopes disjoint. For `worktree_mode: parallel`, the parent must create a separate git worktree before spawning a `worker` subagent.
- If worktree creation fails for a parallel implementation task, do not delegate that task in parallel; collapse it to sequential parent execution.
- Subagents never append `status.log`, regenerate the overview table, create checkpoint commits, or decide that a phase is complete.
- Subagents report findings or completed work back to the parent session for verification and integration.
- Subagents report `done`, `blocked`, or `failed`; the parent verifies acceptance criteria and decides the status transition.
- If a custom Codex agent is added later under `.codex/agents`, it must reference this skill instead of replacing it.

## Workflow

### 1. Read and parse the epic

Discover tasks in this order:
- Preferred: glob `<epic_folder_path>/<NN>-<slug>/task.md`
- Legacy: glob `<epic_folder_path>/*.md`, excluding `epic-overview.md` and `*.plan.md`

If both shapes exist for the same slug, use the folder task and warn about the legacy duplicate.

For each folder-shaped task, read:
- `task.md`
- sibling `plan.md`
- task-local `references/`, `resources/`, and `notes/` when needed for implementation context

For each legacy flat task, read the spec file and sibling `<NN>-<slug>.plan.md`.

Read `status.log`. Sort entries by timestamp. For each slug, take the last entry as current status. Skip slugs whose current status is `done`.

If any non-`done` task is missing its required plan file, stop before execution. Report the missing plan paths and tell the user to run `analyze-epic <epic_folder_path>`.

Crash recovery: detect any slug whose current status is `in_progress` with no terminal entry. For each such slug:

1. Find the last clean checkpoint commit before the `in_progress` transition with `git log --oneline -- <epic_folder_path>`.
2. Show the slug and likely checkpoint commit hash.
3. Ask the user whether to mark completed, mark abandoned for retry, or roll back the epic folder to the checkpoint.
4. Append the chosen transition before continuing.

### 2. Build the phase plan

Group tasks by phase from the plan sidecars. For each task determine:

- slug and spec path
- task folder path when applicable
- current status
- phase
- `worktree_mode`
- likely write scope
- Codex agent role from `references/agent-mapping.md`
- whether it is safe to delegate

Show the plan and wait for user confirmation before starting execution. If the user has not explicitly requested subagents, ask before spawning any.

### 3. Execute phase by phase

For each phase:

1. Append `open->in_progress` for every task selected in the phase.
2. Regenerate the status table in `epic-overview.md`.
3. Execute sequential tasks directly in the parent session.
4. For parallel-safe tasks, create the required worktree and spawn one bounded Codex `worker` subagent per task when explicit subagent execution is confirmed.
5. Wait for delegated results only when the phase cannot progress without them.
6. Verify each task against its `## Acceptance Criteria` before marking it done.
7. Merge and clean up any worktrees before appending `in_progress->done`.

Follow the detailed protocol in `references/orchestration-protocol.md`.

### 4. Track status via status.log

The state machine is `nil -> open -> in_progress -> done`. Every transition is a single append:

```text
2026-04-14T14:30:00Z setup-auth open->in_progress
2026-04-14T14:52:14Z setup-auth in_progress->done
```

Append rules:

- The parent Codex session is the only writer to `status.log`.
- After every append, regenerate the `<!-- STATUS-TABLE-START -->` to `<!-- STATUS-TABLE-END -->` block in `epic-overview.md`.
- Do not mark a task `done` until the parent verifies the acceptance criteria.
- If a task is blocked, append a same-state transition with `# blocker: <reason>`.

### 5. Phase commit

After a phase completes successfully, create one checkpoint commit:

```bash
git add <epic_folder_path>
git commit -m "Run epic <epic_name>: phase <N> complete (<M> tasks done)"
```

One commit per phase, not one commit per task.

### 6. Wrap up

After all executable tasks finish:

- verify final task statuses from `status.log`
- summarize completed work, skipped work, delegated work, and blockers
- leave any unresolved worktree cleanup instructions explicit

## References

- `references/orchestration-protocol.md`
- `references/agent-mapping.md`
- `references/rollback.md`
