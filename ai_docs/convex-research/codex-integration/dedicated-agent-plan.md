# Dedicated Agent Plan

This file defines useful Codex subagent lanes for implementing and verifying the Convex loan assignment. These are workflow roles, not separate production services.

## 1. Convex Schema Agent

Use when:

- creating or reviewing `convex/schema.ts`
- mapping assignment fields to Convex validators
- adding indexes
- checking money fields and stable business IDs

Inputs:

- `final-assignment/05-convex-data-model.md`
- `convex-research/best-practices/convex-implementation-best-practices.md`

Outputs:

- `convex/schema.ts`
- schema review checklist
- index rationale

Must not:

- remove required tables
- replace business IDs with only Convex document IDs
- add sensitive demographic fields

## 2. Seed Data Agent

Use when:

- generating fake applicant data
- writing seed mutations or scripts
- validating the required record counts
- tuning data to produce 2/2/2/2 outcomes

Inputs:

- `final-assignment/07-seed-data-requirements.md`
- `final-assignment/06-scoring-rules.md`

Outputs:

- seed script or seed mutation
- seed validation command
- outcome distribution proof

Must not:

- store final recommendations as seed fields
- use real personal data
- generate raw bank transactions or uploads

## 3. Qualification Logic Agent

Use when:

- implementing live scoring
- writing pure TypeScript scoring helpers
- testing threshold edge cases

Inputs:

- `final-assignment/06-scoring-rules.md`
- qualification response example in `final-assignment/04-api-contract.md`

Outputs:

- scoring helper module
- unit tests
- clear reason and risk factor output

Must handle:

- zero income
- missing profile data
- fewer than 3 monthly summaries
- risk flag severity precedence
- auto-denial before manual review before conditional approval before approval

## 4. HTTP API Agent

Use when:

- implementing `convex/http.ts`
- returning consistent JSON
- adding health/list/detail/qualification endpoints
- validating URL path parameters

Inputs:

- `final-assignment/04-api-contract.md`
- Convex HTTP Actions docs

Outputs:

- `convex/http.ts`
- curl examples
- error response examples

Must not:

- hardcode API responses
- calculate full qualification in the list endpoint unless documented
- leak secrets or real data

## 5. OpenAI Tool Agent

Use when:

- implementing OpenAI Agents SDK integration
- defining `getLoanQualification`
- building a local or hosted agent endpoint
- capturing tool-call proof

Inputs:

- `final-assignment/04-api-contract.md`
- OpenAI Agents SDK docs

Outputs:

- agent script or server endpoint
- `getLoanQualification` tool
- demo command
- trace/log evidence

Must not:

- use another agent runtime as the primary runtime
- call OpenAI from the browser
- answer from prompt-only reasoning without calling the tool

## 6. Optional UI Agent

Use when:

- building Vite + React evaluator console
- showing application selector, question input, answer, and optional evidence

Inputs:

- `final-assignment/README.md`
- `final-assignment/01-assignment-brief.md`

Outputs:

- small Vite + React UI
- no backend logic in UI

Must not:

- duplicate scoring
- expose OpenAI API keys
- hardcode recommendations
- substitute UI screenshots for tool-call proof

## 7. Security and QA Agent

Use when:

- reviewing public endpoint behavior
- checking secrets
- checking `.env*` handling
- checking browser/client boundaries
- running tests and curl proof

Inputs:

- implementation files
- `convex-research/checklists/implementation-checklist.md`

Outputs:

- final QA report
- residual risks
- proof commands

Must check:

- no secrets committed
- fake data only
- OpenAI only server-side
- MCP production access not enabled
- endpoint errors are consistent

## 8. MCP Verifier Agent

Use when:

- Convex MCP is connected
- inspecting deployed tables and functions
- checking logs and insights after deployment

Inputs:

- Convex MCP server
- implemented deployment

Outputs:

- table count proof
- function spec proof
- log/insight review

Safety:

- Prefer dev deployment.
- Avoid production.
- Disable env and mutation-capable tools unless intentionally needed.

