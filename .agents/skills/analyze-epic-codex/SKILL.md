---
name: analyze-epic
description: Analyze a prepared local epic folder to determine dependency phases, parallelization safety, and execution strategy plan files for later implementation. Run after prepare-epic and before run-epic-codex.
---

# Analyze Epic

Build the dependency graph for a local epic folder and write execution strategy plan files that describe safe execution order.

Preferred task shape:

```text
<epic_folder>/<NN>-<slug>/task.md
<epic_folder>/<NN>-<slug>/plan.md
```

Legacy task shape is still accepted:

```text
<epic_folder>/<NN>-<slug>.md
<epic_folder>/<NN>-<slug>.plan.md
```

Plan files never modify task specs.

## Input

Parse one argument:
- `epic_folder_path`: path to the prepared epic folder

If it is missing, ask for it.

Refuse to run if `status.log` is not present in the folder — that means the epic has not been prepared for analysis/execution. Tell the user to run `prepare-epic <epic_folder_path>` first.

## Workflow

### 1. Read and validate tasks

Discover tasks in this order:
- Preferred: glob `<epic_folder_path>/<NN>-<slug>/task.md`
- Legacy: glob `<epic_folder_path>/*.md`, excluding `epic-overview.md` and `*.plan.md`

If both shapes exist for the same slug, use the folder task and warn about the legacy duplicate.

Read each task spec. For folder tasks, also skim task-local `references/`, `resources/`, and `notes/` when they clarify dependencies or conflict risk. Read `status.log` to identify completed tasks (last entry per slug == `done`) and skip them. Warn if any spec is missing critical sections such as `## Type` or `## Dependencies`.

### 2. Build the DAG

Parse dependencies from task descriptions and resolve them to task IDs. Detect:
- cycles
- orphans
- external references

Stop if there is a cycle.

### 3. Assign phases

Topologically sort the DAG into execution phases.

### 4. Analyze conflict risk

Use `references/dependency-analysis.md` plus the task descriptions to determine:
- explicit file overlap
- inferred file overlap
- shared conflict zones

Classify tasks as parallel-safe or sequential.

### 5. Present the analysis

Show:
- dependency graph summary
- phase plan
- parallel windows
- branch/worktree suggestions

Do not wait for confirmation before writing plan files. Continue directly to Step 6 in the same turn.

### 6. Write execution strategy plan files

For each analyzed folder-shaped task, write the plan file at:

```text
<epic_folder_path>/<NN>-<slug>/plan.md
```

For each legacy flat task, write the sidecar plan file at:

```text
<epic_folder_path>/<NN>-<slug>.plan.md
```

Use overwrite-safe writes. This skill is the only writer for plan files, so re-running cleanly replaces previous plans without touching specs or support folders.

Plan file format — YAML frontmatter for the structured fields `run-epic-codex` reads, then a free-text body for human-readable rationale:

```markdown
---
phase: 2
worktree_mode: parallel
conflict_risk: high
branch: feat/add-login
depends_on: [setup-auth]
blocks: [add-logout]
---

# Execution Strategy — add-login

Phase 2, parallel-safe with `add-password-reset`. High conflict risk because both
touch `src/auth/session.ts`; use isolated worktree and merge before phase 3.
```

Frontmatter field semantics:
- `phase`: integer, 1-indexed, from topological sort
- `worktree_mode`: `parallel` | `sequential` | `main`
- `conflict_risk`: `none` | `low` | `medium` | `high`
- `branch`: branch name from the algorithm in `references/dependency-analysis.md`
- `depends_on`: list of slugs this task depends on (within this epic only)
- `blocks`: list of slugs this task blocks (within this epic only)

### 7. Auto-commit

Stage the generated plan files and create a checkpoint commit:

```bash
git add <epic_folder_path>
git commit -m "Analyze epic: <epic_name>"
```

Skip the commit only if re-running analysis produced no changes.

### 8. Handoff

Point the user to:
- `run-epic-codex <epic_folder_path>`

Report that plan files were written and checkpointed, including the task count and any notable sequential/parallel decisions.

## References

- `references/dependency-analysis.md`
