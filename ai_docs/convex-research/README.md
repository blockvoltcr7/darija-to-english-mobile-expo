# Convex Research Package

Research date: 2026-05-16

This folder collects the Convex research needed for the Miami Personal Loan Processor Agent assignment. It is scoped to the current `final-assignment/` package, where Convex is the required backend/database, Convex HTTP Actions are the preferred public API surface, and OpenAI Agents SDK remains the required agent runtime.

## Read This First

1. [Project Fit](./project-fit/loan-assignment-convex-plan.md)
2. [Implementation Best Practices](./best-practices/convex-implementation-best-practices.md)
3. [Codex MCP and Skills](./codex-integration/convex-mcp-and-skills.md)
4. [Dedicated Agent Plan](./codex-integration/dedicated-agent-plan.md)
5. [TypeScript Starter Templates](./templates/typescript-starter-templates.md)
6. [Implementation Checklist](./checklists/implementation-checklist.md)

## Recommended Direction

Use the official Convex bare TypeScript template as the starting point:

```bash
npm create convex@latest loan-processor -- -t bare
```

Then implement:

- `convex/schema.ts` with the exact required tables and indexes.
- Seed mutations or scripts that recreate the 8 application dataset.
- `convex/http.ts` with the required public endpoints.
- A pure TypeScript scoring module used by the qualification endpoint and tests.
- A Node/TypeScript OpenAI Agents SDK service or script that defines `getLoanQualification` and calls the public qualification endpoint.

Add Vite + React only if you want an evaluator console. The UI must not contain scoring logic or call OpenAI directly from the browser.

## Main Sources

- Convex Best Practices: https://docs.convex.dev/understanding/best-practices
- Convex HTTP Actions: https://docs.convex.dev/functions/http-actions
- Convex Schemas: https://docs.convex.dev/database/schemas
- Convex Indexes: https://docs.convex.dev/database/reading-data/indexes
- Convex Environment Variables: https://docs.convex.dev/production/environment-variables
- Convex Testing: https://docs.convex.dev/testing
- Convex MCP Server: https://docs.convex.dev/ai/convex-mcp-server
- Convex Agent Skills: https://docs.convex.dev/ai/agent-skills
- Convex AI Agents: https://docs.convex.dev/agents
- Convex Templates: https://www.convex.dev/templates
- Create Convex package: https://www.npmjs.com/package/create-convex
- Codex MCP docs: https://developers.openai.com/codex/mcp
- Codex Skills docs: https://developers.openai.com/codex/skills

