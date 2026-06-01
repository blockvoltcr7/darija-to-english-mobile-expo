import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = dirname(fileURLToPath(import.meta.url));

const nav = [
  ["index.html", "Index"],
  ["01-project-fit.html", "01 Fit"],
  ["02-implementation.html", "02 Build"],
  ["03-codex-mcp-skills.html", "03 Codex"],
  ["04-agent-plan.html", "04 Agents"],
  ["05-templates.html", "05 Templates"],
  ["06-checklist.html", "06 Checklist"],
];

const sourceLinks = [
  ["Convex Best Practices", "https://docs.convex.dev/understanding/best-practices"],
  ["Convex HTTP Actions", "https://docs.convex.dev/functions/http-actions"],
  ["Convex Schemas", "https://docs.convex.dev/database/schemas"],
  ["Convex Indexes", "https://docs.convex.dev/database/reading-data/indexes"],
  ["Convex MCP Server", "https://docs.convex.dev/ai/convex-mcp-server"],
  ["Convex Agent Skills", "https://docs.convex.dev/ai/agent-skills"],
  ["Convex Templates", "https://www.convex.dev/templates"],
  ["Codex MCP", "https://developers.openai.com/codex/mcp"],
  ["Codex Skills", "https://developers.openai.com/codex/skills"],
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function navHtml(current) {
  return `<nav class="package-nav" aria-label="Convex research pages">
    ${nav
      .map(([href, label]) => {
        const active = href === current ? ` class="active" aria-current="page"` : "";
        return `<a${active} href="${href}">${label}</a>`;
      })
      .join("\n    ")}
  </nav>`;
}

function card(title, body, tone = "") {
  return `<article class="card ${tone}">
    <h3>${title}</h3>
    <div>${body}</div>
  </article>`;
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function code(text) {
  return `<pre><code>${esc(text)}</code></pre>`;
}

function page({ file, title, eyebrow, deck, hero, sections, footerLinks = true }) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | Convex Research</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f2ea;
      --grid: rgba(28, 58, 77, 0.08);
      --surface: #fffdf8;
      --surface-2: #ebe6da;
      --ink: #1d2528;
      --muted: #637071;
      --soft: #7d8989;
      --line: rgba(29, 37, 40, 0.16);
      --line-strong: rgba(29, 37, 40, 0.28);
      --blue: #1e3a5f;
      --blue-soft: #dbe5ee;
      --gold: #b7791f;
      --gold-soft: #f1dfb7;
      --teal: #0f766e;
      --teal-soft: #d2ebe7;
      --rose: #9f1239;
      --rose-soft: #f2d2dc;
      --sage: #4d7c0f;
      --sage-soft: #dbe9c4;
      --shadow: 0 22px 55px rgba(30, 58, 95, 0.13);
      --display: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
      --body: "Avenir Next", "Segoe UI", Verdana, sans-serif;
      --mono: "SFMono-Regular", "Cascadia Mono", Consolas, monospace;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        color-scheme: dark;
        --bg: #111716;
        --grid: rgba(241, 223, 183, 0.06);
        --surface: #19211f;
        --surface-2: #222d2a;
        --ink: #f2eee6;
        --muted: #aebbb8;
        --soft: #8d9b97;
        --line: rgba(255,255,255,0.12);
        --line-strong: rgba(255,255,255,0.25);
        --blue: #9db9d6;
        --blue-soft: rgba(157,185,214,0.14);
        --gold: #e6c36f;
        --gold-soft: rgba(230,195,111,0.14);
        --teal: #58c6bb;
        --teal-soft: rgba(88,198,187,0.14);
        --rose: #f08aa6;
        --rose-soft: rgba(240,138,166,0.14);
        --sage: #a3c56b;
        --sage-soft: rgba(163,197,107,0.14);
        --shadow: 0 22px 55px rgba(0,0,0,0.32);
      }
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
      font-family: var(--body);
      background:
        linear-gradient(90deg, var(--grid) 1px, transparent 1px),
        linear-gradient(0deg, var(--grid) 1px, transparent 1px),
        radial-gradient(circle at 16% 0%, rgba(183,121,31,0.16), transparent 34rem),
        radial-gradient(circle at 88% 16%, rgba(15,118,110,0.14), transparent 28rem),
        var(--bg);
      background-size: 36px 36px, 36px 36px, auto, auto, auto;
    }
    a { color: var(--teal); text-underline-offset: 3px; }
    .shell { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 24px 0 58px; }
    .package-nav {
      position: sticky;
      top: 12px;
      z-index: 20;
      display: flex;
      gap: 7px;
      overflow-x: auto;
      padding: 9px;
      margin-bottom: 34px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: color-mix(in srgb, var(--surface) 88%, transparent);
      backdrop-filter: blur(14px);
      box-shadow: 0 10px 30px rgba(30,58,95,0.08);
    }
    .package-nav a {
      flex: 0 0 auto;
      padding: 9px 13px;
      border-radius: 999px;
      color: var(--muted);
      text-decoration: none;
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 700;
      border: 1px solid transparent;
    }
    .package-nav a:hover { color: var(--ink); background: var(--surface-2); }
    .package-nav a.active {
      color: var(--surface);
      background: var(--blue);
      border-color: var(--blue);
    }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
      gap: 24px;
      align-items: stretch;
      margin-bottom: 26px;
    }
    .hero-main, .hero-side, .panel, .card {
      border: 1px solid var(--line);
      background: var(--surface);
      border-radius: 10px;
    }
    .hero-main { padding: 34px; box-shadow: var(--shadow); }
    .eyebrow {
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 1.8px;
      text-transform: uppercase;
      color: var(--gold);
      font-weight: 800;
      margin-bottom: 16px;
    }
    h1, h2, h3 { margin: 0; }
    h1 {
      font-family: var(--display);
      font-size: clamp(42px, 6vw, 78px);
      line-height: 0.95;
      letter-spacing: 0;
      max-width: 850px;
    }
    .deck { margin-top: 18px; color: var(--muted); font-size: 18px; line-height: 1.55; max-width: 760px; }
    .hero-side { padding: 20px; display: grid; gap: 12px; align-content: start; }
    .metric {
      border: 1px solid var(--line);
      background: var(--surface-2);
      border-radius: 8px;
      padding: 15px;
    }
    .metric strong { display: block; font-size: 28px; font-family: var(--display); }
    .metric span { display: block; color: var(--muted); font-family: var(--mono); font-size: 11px; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 18px 0 28px; }
    .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .card { padding: 18px; min-height: 100%; }
    .card h3 { font-size: 16px; margin-bottom: 10px; }
    .card p, .card li { color: var(--muted); line-height: 1.5; }
    .card ul { margin: 0; padding-left: 18px; }
    .blue { border-color: color-mix(in srgb, var(--blue) 35%, var(--line)); background: linear-gradient(180deg, var(--blue-soft), var(--surface)); }
    .gold { border-color: color-mix(in srgb, var(--gold) 35%, var(--line)); background: linear-gradient(180deg, var(--gold-soft), var(--surface)); }
    .teal { border-color: color-mix(in srgb, var(--teal) 35%, var(--line)); background: linear-gradient(180deg, var(--teal-soft), var(--surface)); }
    .rose { border-color: color-mix(in srgb, var(--rose) 35%, var(--line)); background: linear-gradient(180deg, var(--rose-soft), var(--surface)); }
    .sage { border-color: color-mix(in srgb, var(--sage) 35%, var(--line)); background: linear-gradient(180deg, var(--sage-soft), var(--surface)); }
    .panel { padding: 26px; margin: 18px 0 28px; }
    .panel h2 { font-family: var(--display); font-size: 32px; margin-bottom: 14px; }
    .panel > p { color: var(--muted); line-height: 1.6; }
    .flow {
      display: grid;
      grid-template-columns: repeat(6, minmax(120px, 1fr));
      gap: 10px;
      align-items: stretch;
      margin-top: 18px;
    }
    .step {
      position: relative;
      border: 1px solid var(--line);
      background: var(--surface-2);
      border-radius: 8px;
      padding: 14px;
      min-height: 112px;
    }
    .step b { display: block; font-size: 13px; margin-bottom: 7px; }
    .step span { color: var(--muted); font-size: 13px; line-height: 1.4; }
    .step:not(:last-child)::after {
      content: "";
      position: absolute;
      right: -9px;
      top: 50%;
      width: 8px;
      height: 1px;
      background: var(--line-strong);
    }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
    th { font-family: var(--mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--soft); }
    td { color: var(--muted); }
    td strong { color: var(--ink); }
    pre {
      margin: 14px 0 0;
      padding: 16px;
      overflow-x: auto;
      background: #17201d;
      color: #f5f2ea;
      border-radius: 8px;
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.6;
    }
    .callout {
      border-left: 4px solid var(--gold);
      background: var(--gold-soft);
      padding: 16px 18px;
      border-radius: 8px;
      color: var(--ink);
      margin-top: 14px;
    }
    .links { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 16px; }
    .links a {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 8px 11px;
      background: var(--surface-2);
      text-decoration: none;
      font-family: var(--mono);
      font-size: 11px;
    }
    .footer-nav {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid var(--line);
      font-family: var(--mono);
      font-size: 12px;
    }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .hero, .panel, .card { animation: fadeUp .45s ease both; }
    @media (max-width: 980px) {
      .hero, .grid, .grid.two, .grid.four { grid-template-columns: 1fr; }
      .flow { grid-template-columns: 1fr; }
      .step:not(:last-child)::after { display: none; }
      .hero-main { padding: 24px; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; scroll-behavior: auto !important; transition-duration: .01ms !important; }
    }
  </style>
</head>
<body>
  <div class="shell">
    ${navHtml(file)}
    <header class="hero">
      <div class="hero-main">
        <div class="eyebrow">${eyebrow}</div>
        <h1>${title}</h1>
        <p class="deck">${deck}</p>
      </div>
      <aside class="hero-side">${hero}</aside>
    </header>
    <main>
      ${sections.join("\n")}
    </main>
    ${footerLinks ? footer(file) : ""}
  </div>
</body>
</html>
`;
  writeFileSync(join(outDir, file), html);
}

function footer(current) {
  const idx = nav.findIndex(([href]) => href === current);
  const prev = idx > 0 ? nav[idx - 1] : null;
  const next = idx < nav.length - 1 ? nav[idx + 1] : null;
  return `<footer class="footer-nav">
    <span>${prev ? `<a href="${prev[0]}">Previous: ${prev[1]}</a>` : ""}</span>
    <span>${next ? `<a href="${next[0]}">Next: ${next[1]}</a>` : ""}</span>
  </footer>`;
}

page({
  file: "index.html",
  title: "Convex Loan Processor Research",
  eyebrow: "Visual research pack",
  deck: "A navigable visual version of the Convex research artifacts for the Miami Personal Loan Processor Agent assignment.",
  hero: [
    `<div class="metric"><strong>6</strong><span>research artifacts distilled</span></div>`,
    `<div class="metric"><strong>1</strong><span>recommended scaffold: bare Convex TS</span></div>`,
    `<div class="metric"><strong>8</strong><span>implementation agent lanes</span></div>`,
  ].join(""),
  sections: [
    `<section class="panel">
      <h2>Recommended Direction</h2>
      <p>Build the required backend with Convex, expose the public API with Convex HTTP Actions, and keep the required assessment agent on OpenAI Agents SDK. Add Vite + React only as an evaluator surface.</p>
      ${code("npm create convex@latest loan-processor -- -t bare")}
      <div class="flow">
        <div class="step"><b>Evaluator</b><span>asks about app_001</span></div>
        <div class="step"><b>OpenAI Agent</b><span>server-side SDK runtime</span></div>
        <div class="step"><b>Tool</b><span>getLoanQualification</span></div>
        <div class="step"><b>HTTP Action</b><span>.convex.site endpoint</span></div>
        <div class="step"><b>Convex Data</b><span>records + live scoring</span></div>
        <div class="step"><b>Answer</b><span>grounded reasons</span></div>
      </div>
    </section>`,
    `<section class="grid">
      ${card("Project Fit", "<p>Clarifies the Convex-first assignment boundary and what must not drift.</p>", "blue")}
      ${card("Implementation", "<p>Schema, indexes, HTTP Actions, env, testing, and common Convex pitfalls.</p>", "gold")}
      ${card("Codex Integration", "<p>Convex MCP, Codex config, Convex skills, and safer verification settings.</p>", "teal")}
      ${card("Agent Roles", "<p>Eight dedicated Codex work lanes for implementation and QA.</p>", "sage")}
      ${card("Templates", "<p>Official starter choices and the recommended bare TypeScript path.</p>", "rose")}
      ${card("Checklist", "<p>A go/no-go checklist for scaffold, schema, seed, API, scoring, agent, and proof.</p>", "blue")}
    </section>`,
    `<section class="panel">
      <h2>Source Trail</h2>
      <p>The pages are generated from the markdown package under <code>convex-research/</code> plus the local assignment source under <code>final-assignment/</code>.</p>
      <div class="links">${sourceLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</div>
    </section>`,
  ],
});

page({
  file: "01-project-fit.html",
  title: "Project Fit And Boundaries",
  eyebrow: "01 fit",
  deck: "The local assignment is now Convex-first. This page separates required scope from optional architecture and older context.",
  hero: [
    `<div class="metric"><strong>Convex</strong><span>system of record</span></div>`,
    `<div class="metric"><strong>HTTP</strong><span>preferred API: Convex Actions</span></div>`,
    `<div class="metric"><strong>SDK</strong><span>agent runtime: OpenAI Agents</span></div>`,
  ].join(""),
  sections: [
    `<section class="grid two">
      ${card("Required Shape", list(["Convex backend/database", "Convex HTTP Actions for public API", "OpenAI Agents SDK for the loan advisor", "TypeScript or Node.js", "Fake Miami personal-loan data only"]), "blue")}
      ${card("Optional Shape", list(["Vite + React evaluator console", "Cloud Run as a thin agent/API layer", "Streaming agent response", "Scoring tests", "Seed validation endpoint or command"]), "gold")}
    </section>`,
    `<section class="panel">
      <h2>Non-Negotiables</h2>
      <div class="grid two">
        ${card("Data Model", list(["Nine exact Convex tables", "Stable business IDs", "Integer cents for money", "Required indexes for lookup paths"]), "teal")}
        ${card("Seed And Scoring", list(["8 applications", "2/2/2/2 outcome distribution", "Live recommendation calculation", "No static decision field"]), "sage")}
        ${card("Public API", list(["GET /health", "GET /loan-applications", "GET /loan-applications/:applicationId", "GET /loan-applications/:applicationId/qualification"]), "blue")}
        ${card("Agent Proof", list(["OpenAI Agents SDK", "getLoanQualification tool", "Tool calls qualification endpoint", "Answer grounded in API JSON"]), "rose")}
      </div>
    </section>`,
    `<section class="panel">
      <h2>Do Not Drift</h2>
      <table>
        <tr><th>Risk</th><th>Why it matters</th><th>Guardrail</th></tr>
        <tr><td><strong>Older Neon/Cloud Run context</strong></td><td>The final assignment changed.</td><td>Use Convex as required source of truth.</td></tr>
        <tr><td><strong>Static outcomes</strong></td><td>Assessment grades live calculation.</td><td>Seed inputs, not final decisions.</td></tr>
        <tr><td><strong>UI replaces proof</strong></td><td>Frontend is optional convenience.</td><td>Show OpenAI tool-call evidence.</td></tr>
        <tr><td><strong>Duplicate scoring</strong></td><td>Cloud Run can diverge.</td><td>Keep scoring in one shared path.</td></tr>
      </table>
    </section>`,
  ],
});

page({
  file: "02-implementation.html",
  title: "Convex Implementation Blueprint",
  eyebrow: "02 build",
  deck: "Practical Convex patterns for schema, indexes, HTTP Actions, env variables, testing, and production-adjacent safety.",
  hero: [
    `<div class="metric"><strong>9</strong><span>required tables</span></div>`,
    `<div class="metric"><strong>.site</strong><span>public HTTP host</span></div>`,
    `<div class="metric"><strong>Vitest</strong><span>scoring test layer</span></div>`,
  ].join(""),
  sections: [
    `<section class="panel">
      <h2>Suggested Convex Folder Shape</h2>
      ${code(`convex/
  schema.ts
  http.ts
  model/
    applications.ts
    qualification.ts
  scoring.ts
  seed.ts
  validation.ts`)}
      <div class="callout">Keep wrapper functions thin. Put reusable business logic in plain TypeScript helpers so scoring can be tested without HTTP.</div>
    </section>`,
    `<section class="grid">
      ${card("Schema", list(["Use defineSchema and defineTable", "Use v validators", "Keep business IDs as fields", "Commit generated types when useful"]), "blue")}
      ${card("Indexes", list(["Use withIndex for lookups", "Avoid unbounded collect", "Avoid filter for indexed paths", "Do not remove indexes prematurely"]), "gold")}
      ${card("HTTP Actions", list(["Use httpRouter", "Return Fetch Response objects", "Validate path/body manually", "Return consistent JSON errors"]), "teal")}
      ${card("Env", list(["Use Convex env vars", "Declare in convex.config.ts when possible", "Do not condition exports on env", "No secrets in browser"]), "sage")}
      ${card("Testing", list(["Pure scoring tests", "convex-test for functions", "curl for public endpoints", "seed validation proof"]), "rose")}
      ${card("Out Of Scope", list(["Auth", "Uploads", "Raw bank parsing", "Dashboards", "Production compliance"]), "blue")}
    </section>`,
    `<section class="panel">
      <h2>Common Convex Pitfalls</h2>
      <table>
        <tr><th>Pitfall</th><th>Preferred move</th></tr>
        <tr><td>Using .filter for lookup paths</td><td>Define an index and query with .withIndex</td></tr>
        <tr><td>Unbounded .collect on growing tables</td><td>Use indexes, pagination, or bounded take</td></tr>
        <tr><td>HTTP Actions without validation</td><td>Parse URL/body and validate manually</td></tr>
        <tr><td>Public function without access review</td><td>Even in no-auth assessment, audit exposed behavior</td></tr>
        <tr><td>Secrets in code or UI</td><td>Use server-side env variables only</td></tr>
      </table>
    </section>`,
  ],
});

page({
  file: "03-codex-mcp-skills.html",
  title: "Codex, MCP, And Convex Skills",
  eyebrow: "03 codex",
  deck: "Convex can connect to Codex through the official MCP server and Convex Agent Skills. Use MCP mostly for inspection and verification.",
  hero: [
    `<div class="metric"><strong>MCP</strong><span>deployment interaction</span></div>`,
    `<div class="metric"><strong>Skills</strong><span>workflow instructions</span></div>`,
    `<div class="metric"><strong>Dev</strong><span>default deployment target</span></div>`,
  ].join(""),
  sections: [
    `<section class="panel">
      <h2>Project-Scoped MCP Setup</h2>
      ${code(`codex mcp add convex -- npx -y convex@latest mcp start \\
  --project-dir /Users/samisabir-idrissi/dev/codex-projects/cash-loan-assignment-project \\
  --env-file .env.local`)}
      <p>Verify with <code>codex mcp list</code> and <code>codex mcp get convex</code>.</p>
    </section>`,
    `<section class="grid two">
      ${card("What MCP Can Inspect", list(["deployment status", "tables and schemas", "function specs", "recent logs", "health insights", "environment variables if enabled"]), "teal")}
      ${card("Safety Defaults", list(["Use dev deployment first", "Do not enable production casually", "Disable env mutation tools for broad agents", "Temporarily enable data/run only for explicit verification"]), "rose")}
    </section>`,
    `<section class="panel">
      <h2>Convex Skills</h2>
      ${code(`npx skills add get-convex/agent-skills
npx skills add get-convex/agent-skills --all`)}
      <table>
        <tr><th>Skill</th><th>Use here</th></tr>
        <tr><td><strong>convex-quickstart</strong></td><td>Setup validation after scaffold.</td></tr>
        <tr><td><strong>convex-performance-audit</strong></td><td>Pre-submit query and function review.</td></tr>
        <tr><td><strong>convex-migration-helper</strong></td><td>Only if converting existing data.</td></tr>
        <tr><td><strong>convex-setup-auth</strong></td><td>Skip for this assessment unless scope changes.</td></tr>
      </table>
    </section>`,
    `<section class="panel">
      <h2>Runtime Agent Component</h2>
      <p><code>@convex-dev/agent</code> is useful future context for persistent Convex-native agents, threads, messages, RAG, and workflows. It should not replace OpenAI Agents SDK for this assessment.</p>
    </section>`,
  ],
});

page({
  file: "04-agent-plan.html",
  title: "Dedicated Agent Work Plan",
  eyebrow: "04 agents",
  deck: "Eight focused Codex lanes for building and verifying the assignment without mixing responsibilities.",
  hero: [
    `<div class="metric"><strong>8</strong><span>agent lanes</span></div>`,
    `<div class="metric"><strong>QA</strong><span>separate verification lane</span></div>`,
    `<div class="metric"><strong>MCP</strong><span>post-deploy verifier</span></div>`,
  ].join(""),
  sections: [
    `<section class="grid four">
      ${card("Schema Agent", "<p>Owns validators, indexes, business IDs, and cents fields.</p>", "blue")}
      ${card("Seed Agent", "<p>Owns fake data, record counts, relationship proof, and 2/2/2/2 distribution.</p>", "gold")}
      ${card("Scoring Agent", "<p>Owns pure qualification rules, edge cases, reasons, and risk factors.</p>", "teal")}
      ${card("HTTP API Agent", "<p>Owns Convex HTTP Actions, route behavior, and JSON errors.</p>", "sage")}
      ${card("OpenAI Tool Agent", "<p>Owns getLoanQualification and Agents SDK proof.</p>", "rose")}
      ${card("Optional UI Agent", "<p>Owns evaluator console only, without backend logic.</p>", "blue")}
      ${card("Security QA Agent", "<p>Owns secrets, exposure, browser boundary, and final command proof.</p>", "gold")}
      ${card("MCP Verifier Agent", "<p>Owns table/function/log inspection after deployment.</p>", "teal")}
    </section>`,
    `<section class="panel">
      <h2>Parallelization Rule</h2>
      <p>Split agents by write ownership: schema, seed data, scoring, API, agent service, UI, and QA. Keep scoring as a shared contract so API and agent work do not fork the business rules.</p>
      <div class="flow">
        <div class="step"><b>Schema</b><span>tables and indexes</span></div>
        <div class="step"><b>Seed</b><span>dataset + validation</span></div>
        <div class="step"><b>Scoring</b><span>pure rules</span></div>
        <div class="step"><b>API</b><span>HTTP Actions</span></div>
        <div class="step"><b>Agent</b><span>SDK tool call</span></div>
        <div class="step"><b>QA</b><span>proof package</span></div>
      </div>
    </section>`,
    `<section class="panel">
      <h2>Hard Boundaries</h2>
      <table>
        <tr><th>Lane</th><th>Must not do</th></tr>
        <tr><td>Seed Data</td><td>Store final recommendations or use real personal data.</td></tr>
        <tr><td>Scoring</td><td>Ignore missing data, zero income, or precedence edge cases.</td></tr>
        <tr><td>HTTP API</td><td>Return hardcoded JSON instead of Convex reads.</td></tr>
        <tr><td>OpenAI Tool</td><td>Answer without calling getLoanQualification.</td></tr>
        <tr><td>UI</td><td>Call OpenAI directly or duplicate scoring.</td></tr>
      </table>
    </section>`,
  ],
});

page({
  file: "05-templates.html",
  title: "TypeScript Starter Templates",
  eyebrow: "05 templates",
  deck: "The leanest path is the official Convex bare TypeScript template. Other starters are useful only when their extra surface area is intentional.",
  hero: [
    `<div class="metric"><strong>bare</strong><span>recommended template</span></div>`,
    `<div class="metric"><strong>Vite</strong><span>optional UI path</span></div>`,
    `<div class="metric"><strong>Next</strong><span>heavier agent endpoint option</span></div>`,
  ].join(""),
  sections: [
    `<section class="panel">
      <h2>Best Fit</h2>
      ${code(`npm create convex@latest loan-processor -- -t bare
cd loan-processor
npx convex dev`)}
      <p>Use this when the deliverable is mostly backend, HTTP Actions, seed data, scoring, and tool-call proof.</p>
    </section>`,
    `<section class="panel">
      <h2>Template Matrix</h2>
      <table>
        <tr><th>Starter</th><th>Command</th><th>Fit</th></tr>
        <tr><td><strong>Bare Convex TS</strong></td><td><code>-t bare</code></td><td>Best required backend fit.</td></tr>
        <tr><td><strong>React Vite shadcn</strong></td><td><code>-t react-vite-shadcn</code></td><td>Good optional evaluator UI.</td></tr>
        <tr><td><strong>React Vite</strong></td><td><code>-t react-vite</code></td><td>Good minimal UI.</td></tr>
        <tr><td><strong>Next.js</strong></td><td><code>-t nextjs</code></td><td>Acceptable but heavier.</td></tr>
        <tr><td><strong>Next.js Clerk</strong></td><td><code>-t nextjs-clerk-shadcn</code></td><td>Poor MVP fit because auth is out of scope.</td></tr>
        <tr><td><strong>@convex-dev/agent</strong></td><td><code>npm install @convex-dev/agent</code></td><td>Future Convex-native agent option, not replacement runtime.</td></tr>
      </table>
    </section>`,
    `<section class="grid two">
      ${card("Optional UI Add-On", `${code("npm create vite@latest evaluator-ui -- --template react-ts")}<p>Keep UI as a client of the server-side agent endpoint.</p>`, "teal")}
      ${card("Agent Service", "<p>A small Node/TypeScript service can host the OpenAI Agents SDK endpoint and call the public Convex qualification API. Cloud Run is optional for hosting this service.</p>", "gold")}
    </section>`,
  ],
});

page({
  file: "06-checklist.html",
  title: "Go/No-Go Checklist",
  eyebrow: "06 checklist",
  deck: "A visual delivery checklist for deciding whether the Convex loan processor is implementation-complete and demo-ready.",
  hero: [
    `<div class="metric"><strong>Schema</strong><span>tables + indexes</span></div>`,
    `<div class="metric"><strong>Seed</strong><span>counts + outcomes</span></div>`,
    `<div class="metric"><strong>Proof</strong><span>agent tool call</span></div>`,
  ].join(""),
  sections: [
    `<section class="grid">
      ${card("Scaffold", list(["Convex project initialized", "npx convex dev works", "generated files present", ".env.local ignored", "README setup path exists"]), "blue")}
      ${card("Schema", list(["9 required tables", "all money in cents", "business IDs indexed", "relationship lookup indexes", "no final decision table"]), "gold")}
      ${card("Seed", list(["11 users", "8 applications", "24 monthly summaries", "relationships validate", "2/2/2/2 outcomes"]), "teal")}
      ${card("API", list(["4 required GET endpoints", "404 and 500 JSON shapes", "qualification reads related tables", "public base URL documented"]), "sage")}
      ${card("Scoring", list(["income/expense/net cash flow", "overdrafts and balances", "income mismatch and DTI", "risk flags and max amount", "rule precedence correct"]), "rose")}
      ${card("Agent", list(["OpenAI Agents SDK", "getLoanQualification tool", "tool calls public endpoint", "answer grounded in JSON", "tool-call evidence captured"]), "blue")}
    </section>`,
    `<section class="panel">
      <h2>Final Proof Chain</h2>
      <div class="flow">
        <div class="step"><b>Question</b><span>applicationId + prompt</span></div>
        <div class="step"><b>Agent</b><span>OpenAI Agents SDK</span></div>
        <div class="step"><b>Tool</b><span>getLoanQualification</span></div>
        <div class="step"><b>API</b><span>qualification endpoint</span></div>
        <div class="step"><b>Convex</b><span>live records</span></div>
        <div class="step"><b>Answer</b><span>reasons + risks</span></div>
      </div>
      <div class="callout">No-go if the demo only shows a UI or a direct qualification endpoint call without proving the OpenAI Agents SDK tool call.</div>
    </section>`,
    `<section class="panel">
      <h2>Codex/MCP Readiness</h2>
      <table>
        <tr><th>Check</th><th>Pass condition</th></tr>
        <tr><td>Convex MCP</td><td>Configured only after a deployment exists.</td></tr>
        <tr><td>Deployment target</td><td>Dev by default; production not casually enabled.</td></tr>
        <tr><td>Env tools</td><td>Disabled for broad autonomous verification where possible.</td></tr>
        <tr><td>Skills</td><td>Installed only when useful; auth skill skipped unless scope changes.</td></tr>
      </table>
    </section>`,
  ],
});

console.log(`Generated ${nav.length} HTML pages in ${outDir}`);
