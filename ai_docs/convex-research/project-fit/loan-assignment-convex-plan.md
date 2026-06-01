# Loan Assignment Convex Plan

## Current Assignment Shape

The final assignment is Convex-first:

- Backend/database: Convex.
- API surface: Convex HTTP Actions, exposed at a `.convex.site` URL.
- Agent runtime: OpenAI Agents SDK.
- Language: TypeScript or Node.js.
- Optional UI: Vite + React.
- Optional advanced layer: Cloud Run as a thin API or agent service, not as a replacement backend.

This supersedes older Neon + required Cloud Run discussion. Cloud Run can still be useful for a conventional Node agent endpoint, but it should not create a second database source of truth or duplicate scoring rules.

## Non-Negotiables

- Implement exactly these Convex tables: `users`, `loanApplications`, `employmentProfiles`, `creditProfiles`, `bankStatementRequests`, `parsedBankStatements`, `bankStatementMonthlySummaries`, `debtObligations`, `riskFlags`.
- Keep stable business IDs such as `user_001` and `app_001` as indexed string fields. Do not confuse them with Convex document IDs.
- Store money as integer cents.
- Seed exactly 8 applications with a calculated distribution of 2 `approved`, 2 `conditionally_approved`, 2 `manual_review`, and 2 `denied`.
- Expose `GET /health`, `GET /loan-applications`, `GET /loan-applications/:applicationId`, and `GET /loan-applications/:applicationId/qualification`.
- Calculate qualification live from Convex records. Do not store final decisions as seed fields.
- Build an OpenAI Agents SDK agent with a `getLoanQualification` tool.
- Provide evidence that the agent called the tool.

## Recommended Architecture

```text
Evaluator or demo UI
  -> server-side OpenAI Agents SDK agent
  -> getLoanQualification tool
  -> GET /loan-applications/:applicationId/qualification
  -> Convex HTTP Action
  -> internal Convex query/model helpers
  -> live scoring calculation
  -> JSON response
  -> grounded agent answer
```

## Convex Responsibilities

- Own all application data.
- Own schema validators and indexes.
- Own seed data and seed validation.
- Own public loan API endpoints.
- Own live scoring reads and calculation inputs.

## Agent Service Responsibilities

- Keep `OPENAI_API_KEY` server-side.
- Accept `applicationId` and user question.
- Define `getLoanQualification`.
- Call the public qualification endpoint.
- Answer only from the returned API data.
- Log or expose enough trace evidence to prove the tool call happened.

## Optional UI Responsibilities

- Let an evaluator select or enter `applicationId`.
- Send the question to a server-side agent endpoint.
- Display the grounded answer.
- Optionally display qualification JSON or tool-call evidence.

The UI must not calculate scoring, contain OpenAI secrets, hardcode outcomes, or replace tool-call evidence.

## Project Risks

- Spec drift from older Neon/Cloud Run context.
- Static seeded outcomes instead of calculated outcomes.
- Relationship inconsistency because Convex does not enforce SQL foreign keys.
- Incorrect scoring precedence.
- Public fake-data endpoint accidentally treated like a production lending API.
- Agent demo that shows the qualification endpoint but not an OpenAI Agents SDK tool call.
- Duplicate scoring if Cloud Run is added.

## Sources

- Local source of truth: `final-assignment/README.md`
- Local assignment brief: `final-assignment/01-assignment-brief.md`
- Local API contract: `final-assignment/04-api-contract.md`
- Local data model: `final-assignment/05-convex-data-model.md`
- Local scoring rules: `final-assignment/06-scoring-rules.md`
- Local seed requirements: `final-assignment/07-seed-data-requirements.md`

