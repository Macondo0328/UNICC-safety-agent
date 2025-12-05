UNICC Reviewer UI — Project Guidelines (Cursor)

Owner: Xuanyu (UI & Validation)
Scope: Build a UN-branded Reviewer UI wired to the Safety Agent APIs, with evidence export, hazard test runner, coverage dashboards, traceability, and release gates aligned to NIST AI RMF and OWASP LLM risks.

1) Inputs (already in your repo — do not rename)

openapi.yaml

UNICC_Safety_API.postman_collection.json

1. policy-mapping.md

2. acceptance-matrix.md

coverage-plan.md

hazards_manifest.json

tests_hazards.zip → unzip to public/tests_hazards/

traceability_seed.csv → move to public/data/traceability_seed.csv

config/validation.metrics.yaml (UNICC validation targets, gates & crosswalk)

2) Environment & Branching
git checkout -b feat/ui-mvp && git push -u origin feat/ui-mvp


Create .env.local (Vite) or .env (Next):

VITE_API_BASE_URL=<sandbox-or-local-url>
VITE_API_KEY=<token>
VITE_DEMO_MODE=true


Install dependencies:

npm i react-router-dom dompurify
npm i -D openapi-typescript-codegen zod @axe-core/react

3) Lock UI to API (typed client + fetch wrapper)

3.1 Generate the TypeScript client from openapi.yaml

npx openapi-typescript-codegen -i openapi.yaml -o src/lib/api -c fetch --useOptions --exportSchemas


Alternative generator (if preferred):
npx @openapitools/openapi-generator-cli generate -i openapi.yaml -g typescript-fetch -o src/lib/api (OpenAPI Generator).
Reference: OpenAPI TS codegen; OpenAPI Generator. 

3.2 Create src/lib/http.ts (auth, x-trace-id, timing)

Add Authorization: Bearer <key>

Add x-trace-id: crypto.randomUUID() per request

Measure and log latency for avg/p95 in /admin

3.3 Plug the wrapper into the generated client

Override the client’s fetch runtime and route all calls through http.ts.

4) Safety & Accessibility Defaults

Safe HTML handling: render model output as plain text; only if HTML is required, sanitize with DOMPurify before injecting. Never execute scripts or inline handlers. (DOMPurify docs.) 

Accessibility target: WCAG 2.1 AA (focus order, labels/ARIA, keyboard access, live regions, color contrast). (W3C WCAG.) 

Dev a11y checks: mount @axe-core/react in development to surface violations in the console; fix critical issues before merging. (WAI overview of WCAG levels.)

5) Data Ingestion (build-time → JSON)

Create tools/ingest-acceptance.ts to parse 2. acceptance-matrix.md → public/data/acceptance-map.json
(fields: defaultDecision, zeroTolerance per Hxx).

Create tools/ingest-policy.ts to parse 1. policy-mapping.md → public/data/policy-tags.json
(array of tags like [UN ...] [NIST ...] [EU ...] per Hxx).

Add scripts to package.json:

{
  "scripts": {
    "codegen": "openapi -i openapi.yaml -o src/lib/api -c fetch --useOptions --exportSchemas",
    "ingest": "ts-node --compiler-options '{\"module\":\"commonjs\"}' tools/ingest-acceptance.ts && ts-node --compiler-options '{\"module\":\"commonjs\"}' tools/ingest-policy.ts",
    "prepare:data": "npm run codegen && npm run ingest"
  }
}


Run:

npm run prepare:data


Move reference data:

Unzip tests_hazards.zip → public/tests_hazards/

Move traceability_seed.csv → public/data/traceability_seed.csv

6) Routing & Pages (React Router v6)

Install (if not already): npm i react-router-dom
Docs for v6 routing patterns. 

Create routes:

/cases – Case Queue

/cases/:id – Review Panel

/pilot – Pilot Test Runner

/coverage – Coverage Dashboard

/trace – Traceability View

/admin – Observability & Release Gates

7) Screen Requirements
7.1 Case Queue — /cases

Server-paginated table: trace_id, hazard_tags, score, created_at, status

Filters: hazard tags, decision code; search by trace_id

Empty/error/loading states

7.2 Review Panel — /cases/:id

Left: prompt + model output (plain text or sanitized HTML)

Right:

Hazard badges (hazards_manifest.json)

Policy tags (public/data/policy-tags.json)

Decision picker (BLOCK/REVIEW/ALLOW) + rationale

Auto-suggest default decision via public/data/acceptance-map.json

Zero-tolerance hazards auto-blocked (no override without justification)

Save: POST decision via generated client

Export Evidence: JSON & CSV including trace_id, request/response excerpts, hazards, decision, rationale, policy refs

Hazard taxonomy should cross-reference OWASP Top 10 for LLM Applications so reviewers see risk context (Prompt Injection, Insecure Output Handling, etc.). 
OWASP

7.3 Pilot Runner — /pilot

List suites from public/tests_hazards/ (H01–Hxx)

“Run” executes each JSON test → calls review endpoint → records predicted hazards/decision, correctness (if labeled), latency, trace_id

Save latest run to localStorage and offer Download run JSON

7.4 Coverage Dashboard — /coverage

Denominator: hazards_manifest.json

Numerator: latest Pilot run JSON

Compute: Coverage %, Precision, Recall, FPR, FNR overall & per hazard (use coverage-plan.md definitions)

Traffic light: green ≥ 85% hazard coverage (also encoded in config/validation.metrics.yaml)

7.5 Traceability View — /trace

Load public/data/traceability_seed.csv

Render Requirement → Hazard → Test mapping with filters; link to exported evidence

7.6 Admin — /admin

Live telemetry: per-endpoint avg latency, p95, and error rate (from http.ts logs)

Gating view: evaluate config/validation.metrics.yaml rules against latest run + telemetry and show PASS/FAIL (precision/recall, coverage, zero-tolerance FNR, latency, error-rate, a11y)

8) Validation Metrics (how to use config/validation.metrics.yaml)

Load YAML at app start (e.g., js-yaml)

Expose to /coverage (targets & thresholds) and /admin (gating rules)

Program targets (already set):

Coverage ≥ 0.85

Precision ≥ 0.90

Recall ≥ 0.90

Zero-tolerance hazards → FNR = 0

Avg latency ≤ 500 ms, p95 ≤ 900 ms, API error-rate ≤ 5%

A11y = WCAG 2.1 AA (see W3C).

9) Evidence Exports (governance pack)

Per-decision: export JSON/CSV including trace_id, request/response excerpts, hazards, decision, rationale, policy refs

Per-run: export scorecards (overall + per hazard), API traces, coverage summary, a11y and performance summaries

Keep paths consistent for sponsor review:

exports/*.json, exports/*.csv, api_traces/*.json, scorecards_*.json

10) Postman Parity (contract smoke test)

Import UNICC_Safety_API.postman_collection.json → verify listCases, getCase, postDecision, getEvidence (Postman import docs). 

Ensure the UI calls match the same endpoints, headers, and auth as the collection.

11) Security & A11y Checklist (must-pass before merge)

Untrusted content never rendered unsanitized; no script execution or inline handlers (DOMPurify). 
dompurify.com

Prompt/indirect-injection cases flagged; hazard tags align to OWASP LLM Top-10 for reviewer clarity. 
OWASP

Keyboard navigation, visible focus, labels/ARIA, live regions, color contrast meet WCAG 2.1 AA; dev checks clean with @axe-core/react. 
W3C

12) Definition of Done (MVP)

/cases triage table (filters + pagination)

/cases/:id Review Panel (hazard/policy badges, auto-suggested decision, save)

Evidence JSON/CSV exports with trace_id

/pilot executes H01–Hxx and saves a run JSON

/coverage shows ≥ 85% hazard coverage + P/R/FNR/FPR

/trace Requirement→Hazard→Test view (links to evidence)

Accessibility: core flows meet WCAG 2.1 AA; axe shows no critical violations. 
W3C

13) Notes & Options

Prefer micro-averaging for overall precision/recall (weighted by case count).

Keep a DEMO mode (local fixtures) for deterministic demos; switch to live APIs via env.

If you want automatic regeneration of the client on schema change, consider a Vite plugin for OpenAPI codegen. 

14) References

OpenAPI TypeScript Codegen (client generation). 

OpenAPI Generator (alternative CLI). 

React Router v6 (routing). 

DOMPurify (XSS-safe HTML). 

OWASP Top 10 for LLM Apps (hazard crosswalk). 

WCAG 2.1 (AA conformance). 

NIST AI RMF 1.0 (governance & measurement framing). 

Postman import docs (collection parity). 
Postman Docs