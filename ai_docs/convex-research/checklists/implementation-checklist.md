# Convex Loan Processor Implementation Checklist

Use this as a go/no-go checklist before treating the assignment as done.

## Scaffold

- [ ] Project was started from `npm create convex@latest ... -- -t bare` or an equivalent TypeScript Convex setup.
- [ ] `npx convex dev` has been run successfully.
- [ ] Convex generated files are present.
- [ ] `.env.local` and secret files are ignored.
- [ ] README explains local setup, seed, run, test, and deploy.

## Schema

- [ ] `convex/schema.ts` exists.
- [ ] `users` table exists.
- [ ] `loanApplications` table exists.
- [ ] `employmentProfiles` table exists.
- [ ] `creditProfiles` table exists.
- [ ] `bankStatementRequests` table exists.
- [ ] `parsedBankStatements` table exists.
- [ ] `bankStatementMonthlySummaries` table exists.
- [ ] `debtObligations` table exists.
- [ ] `riskFlags` table exists.
- [ ] Money fields are integer cents.
- [ ] Stable business IDs are string fields.
- [ ] Required indexes are defined.
- [ ] No final decision table or static recommendation field is present.

## Seed Data

- [ ] 11 users.
- [ ] 8 applicants.
- [ ] 2 loan officers.
- [ ] 1 admin.
- [ ] 8 loan applications.
- [ ] 8 employment profiles.
- [ ] 8 credit profiles.
- [ ] 8 bank statement requests.
- [ ] 8 parsed bank statements.
- [ ] 24 monthly summary records.
- [ ] Each application has exactly 3 monthly summaries.
- [ ] Debt obligations are realistic enough to exercise DTI.
- [ ] Risk flags exercise low, medium, high, or critical paths as needed.
- [ ] Seed data produces 2 approved, 2 conditionally approved, 2 manual review, and 2 denied outcomes.
- [ ] A seed validation command or endpoint proves the above.

## API

- [ ] `GET /health` works.
- [ ] `GET /loan-applications` works.
- [ ] `GET /loan-applications/:applicationId` works.
- [ ] `GET /loan-applications/:applicationId/qualification` works.
- [ ] Missing application returns a consistent 404 JSON shape.
- [ ] Internal errors return a consistent 500 JSON shape.
- [ ] Qualification endpoint reads related Convex tables.
- [ ] Qualification endpoint does not use hardcoded outcomes.
- [ ] Public base URL is documented.

## Scoring

- [ ] Average monthly income is calculated from 3 monthly summaries.
- [ ] Average expenses are calculated.
- [ ] Average net cash flow is calculated.
- [ ] Total overdraft count and fees are calculated.
- [ ] Average ending balance is calculated.
- [ ] Cash-flow trend is calculated.
- [ ] Income mismatch percent is calculated.
- [ ] Monthly debt payments are calculated.
- [ ] DTI is calculated, with zero income handled.
- [ ] Credit band is calculated.
- [ ] Risk flag severity affects status correctly.
- [ ] Recommended max amount uses the required formula and caps.
- [ ] Rule precedence is denial, manual review, conditional approval, approval.
- [ ] `reasons` and `riskFactors` are human-readable.

## OpenAI Agents SDK

- [ ] OpenAI Agents SDK is used.
- [ ] A tool named `getLoanQualification` exists.
- [ ] Tool input includes `applicationId`.
- [ ] Tool calls `GET /loan-applications/:applicationId/qualification`.
- [ ] Agent answer is grounded in returned JSON.
- [ ] Tool-call evidence is captured in logs, screenshots, traces, curl output, or README.
- [ ] OpenAI API key is never exposed in browser code.

## Optional UI

- [ ] UI is Vite + React if built.
- [ ] UI calls a server-side agent endpoint.
- [ ] UI does not call OpenAI directly.
- [ ] UI does not duplicate scoring rules.
- [ ] UI does not hardcode recommendations.
- [ ] UI is presented as evaluator convenience, not backend proof.

## Codex and MCP

- [ ] Convex MCP is configured only after the project has a Convex deployment.
- [ ] MCP uses dev deployment by default.
- [ ] Production access is not enabled unless intentionally required.
- [ ] Env tools are disabled for broad autonomous verification when possible.
- [ ] Convex agent skills are installed only if useful for implementation.

## Final Proof

- [ ] Public API base URL is included.
- [ ] Agent access method or URL is included.
- [ ] Setup commands are included.
- [ ] Seed commands are included.
- [ ] Test commands are included.
- [ ] Demo flow is documented.
- [ ] Evidence proves the full chain: agent -> tool -> public API -> Convex -> live scoring -> grounded answer.

