# Convex MCP and Codex Skills

Research date: 2026-05-16

## Convex MCP Server

Convex has an official MCP server built into the Convex CLI.

Base command:

```bash
npx -y convex@latest mcp start
```

Recommended project-scoped Codex registration:

```bash
codex mcp add convex -- npx -y convex@latest mcp start \
  --project-dir /Users/samisabir-idrissi/dev/codex-projects/cash-loan-assignment-project \
  --env-file .env.local
```

Equivalent `~/.codex/config.toml` entry:

```toml
[mcp_servers.convex]
command = "npx"
args = [
  "-y",
  "convex@latest",
  "mcp",
  "start",
  "--project-dir",
  "/Users/samisabir-idrissi/dev/codex-projects/cash-loan-assignment-project",
  "--env-file",
  ".env.local"
]
enabled = true
```

Verify:

```bash
codex mcp list
codex mcp get convex
```

Sources:

- https://docs.convex.dev/ai/convex-mcp-server
- https://developers.openai.com/codex/mcp

## MCP Tool Capabilities

The Convex MCP server can expose tools for:

- deployment status
- table and schema inspection
- data browsing
- read-only one-off queries
- function metadata
- running deployed functions
- logs
- health insights
- environment variable list/get/set/remove

Use this for verification and debugging after the Convex project exists. For this loan assignment, the MCP verifier should inspect tables, counts, function specs, logs, and route behavior after implementation.

## Safety Profile

Production access is blocked by default. Do not enable production access casually.

Avoid this unless intentionally doing production operations:

```bash
npx -y convex@latest mcp start --dangerously-enable-production-deployments
```

Safer verification-oriented MCP registration:

```bash
codex mcp add convex-verify -- npx -y convex@latest mcp start \
  --project-dir /Users/samisabir-idrissi/dev/codex-projects/cash-loan-assignment-project \
  --env-file .env.local \
  --disable-tools data,run,envGet,envList,envSet,envRemove
```

Tradeoff: disabling `data` and `run` makes the server safer but limits end-to-end verification. Temporarily enable narrowly when you need table inspection or function execution, then turn it back off.

## Convex Agent Skills

Convex publishes installable agent skills:

```bash
npx skills add get-convex/agent-skills
```

Install all:

```bash
npx skills add get-convex/agent-skills --all
```

They install into:

```text
.agents/skills/
```

Documented skills include:

- `convex-quickstart`
- `convex-setup-auth`
- `convex-migration-helper`
- `convex-create-component`
- `convex-performance-audit`

Codex manual invocation format is:

```text
$skill-name
```

Sources:

- https://docs.convex.dev/ai/agent-skills
- https://github.com/get-convex/agent-skills
- https://developers.openai.com/codex/skills

## How To Use Skills In This Project

Recommended:

- Install Convex skills after the repo scaffold exists.
- Use `convex-quickstart` for setup validation.
- Use `convex-performance-audit` before final submission.
- Use `convex-migration-helper` only if converting an existing data model.
- Skip `convex-setup-auth` for this assessment unless the assignment changes, because auth is out of scope.

## Convex Runtime Agent Component

Convex also has `@convex-dev/agent`, a runtime component for persistent AI agents, threads, messages, tool calls, streaming, RAG, workflows, usage tracking, and rate limiting.

Install pattern:

```bash
npm install @convex-dev/agent
```

Convex config pattern:

```ts
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(agent);
export default app;
```

This is useful future architecture context. It should not replace the required OpenAI Agents SDK runtime for the current assignment unless the assignment is explicitly revised.

Sources:

- https://docs.convex.dev/agents
- https://docs.convex.dev/agents/getting-started
- https://github.com/get-convex/agent

## Background Agent Mode

Convex documents an agent mode for remote/cloud coding agents:

```bash
CONVEX_AGENT_MODE=anonymous npx convex dev --once
```

Use this when a remote agent needs a Convex dev deployment without using a personal logged-in deployment. For local Codex work on this machine, normal `npx convex dev` is usually simpler.

Sources:

- https://docs.convex.dev/cli/agent-mode
- https://docs.convex.dev/ai

