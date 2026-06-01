# Convex TypeScript Starter Templates

Research date: 2026-05-16

## Best Fit For This Assignment

Start with the official bare Convex template:

```bash
npm create convex@latest loan-processor -- -t bare
```

Why:

- Backend-first.
- TypeScript-friendly.
- No UI/auth/SaaS clutter.
- Best match for `convex/schema.ts`, HTTP Actions, seed scripts, and scoring logic.

Then add a separate Vite + React evaluator UI only if needed.

## Template Matrix

| Starter/template | Install command | Use when | Fit for this assignment |
| --- | --- | --- | --- |
| Official Convex bare TypeScript | `npm create convex@latest my-app -- -t bare` | Backend/API-first Convex project | Best fit |
| Official Convex Vite React + shadcn | `npm create convex@latest my-app -- -t react-vite-shadcn` | Optional evaluator UI with a polished component base | Good optional UI fit |
| Official Convex Vite React | `npm create convex@latest my-app -- -t react-vite` | Optional minimal Vite UI | Good optional UI fit |
| Official Convex Next.js | `npm create convex@latest my-app -- -t nextjs` | Next.js routing or hosted server endpoint is desired | Acceptable but heavier |
| Official Convex Next.js + Clerk/shadcn | `npm create convex@latest my-app -- -t nextjs-clerk-shadcn` | Authenticated SaaS/dashboard | Poor MVP fit because auth is out of scope |
| Official Convex Node.js quickstart | manual `npm init`, `npm install convex dotenv`, `npx convex dev` | Node scripts, seed harness, thin agent service | Useful reference, not a full app template |
| Official Convex Agent Component | `npm install @convex-dev/agent` | Persistent Convex-native agent apps | Future option, not a replacement for OpenAI Agents SDK here |
| Convex AI Chat examples | clone official examples | Chat/RAG references | Useful reference, overkill for deterministic loan scoring |
| Vercel Next.js Convex template | Vercel deploy or clone repo | Fast hosted Next.js + Convex demo | Deployment learning, not the leanest assignment base |

## Official Template Presets

The `create-convex` package lists current presets including:

- `bare`
- `nextjs-shadcn`
- `nextjs-clerk`
- `nextjs-convexauth-shadcn`
- `nextjs-lucia-shadcn`
- `react-vite-clerk-shadcn`
- `react-vite-shadcn`

It also supports GitHub repositories as templates:

```bash
npm create convex@latest my-app -- -t owner/repo
```

and branch-specific templates:

```bash
npm create convex@latest my-app -- -t 'owner/repo#branch-name'
```

## Recommended Scaffold Choices

### Required Backend/API Only

```bash
npm create convex@latest loan-processor -- -t bare
cd loan-processor
npx convex dev
```

Add:

- `convex/schema.ts`
- `convex/http.ts`
- `convex/model/*`
- seed script or seed mutation
- tests

### Backend Plus Optional Evaluator UI

Option 1: use Vite template up front:

```bash
npm create convex@latest loan-processor -- -t react-vite-shadcn
```

Option 2: keep backend bare and add UI later:

```bash
npm create vite@latest evaluator-ui -- --template react-ts
```

If using option 2, keep the UI as a client of the server-side agent endpoint. Do not move OpenAI or scoring into the browser.

### Agent Service

For the OpenAI Agents SDK service, a small Node/TypeScript service is enough. It can live beside the Convex backend and call the public qualification endpoint. Cloud Run is optional if you want the agent endpoint hosted separately.

## Sources

- Convex templates page: https://www.convex.dev/templates
- `create-convex` npm package: https://www.npmjs.com/package/create-convex
- Convex templates repo: https://github.com/get-convex/templates
- React Vite Clerk shadcn template repo: https://github.com/get-convex/template-react-vite-clerk-shadcn
- Convex Node.js quickstart: https://docs.convex.dev/quickstart/nodejs
- Convex Agent docs: https://docs.convex.dev/agents
- Convex Agent repo: https://github.com/get-convex/agent
- Convex AI Chat example: https://github.com/get-convex/convex-ai-chat
- Vercel Convex template: https://vercel.com/templates/backend/next-js-convex-template

