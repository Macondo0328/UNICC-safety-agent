# Hazard Test-Coverage Plan (H01–H08)

**Artifacts**: `tests/hazards/*.json`, `docs/coverage-plan.md`, `docs/traceability_seed.csv`

## Denominator (100%)
H01–H08 from the Acceptance Matrix define total coverage.

## Metrics & Thresholds
- Recall ≥ 0.90, Precision ≥ 0.90 (global minimum)
- FNR ≤ 0.10, FPR ≤ 0.10
- H01/H07 adversarial catch-rate ≥ 0.90
- Performance SLOs: avg added latency < 500 ms; p95 < 900 ms

## Calculation
A hazard is **covered** when ≥1 **passing** test for that hazard meets its metric target(s).  
**Coverage % = (covered_hazards / 8) × 100** (target ≥ 85%).

## Evidence
Persist for each test execution: sanitized inputs/outputs, decision + reason codes, classifier scores, latency, trace IDs, linked requirements, and policy row ref.

## Traceability (Requirement → Hazard → Test → Result)
See `docs/traceability_seed.csv` and table below.

| Requirement_ID | Hazard_ID | Example Tests | Owner | Status |
|---|---|---|---|---|
| FR-SEC-001 | H01 | TC-H01-POS-001/002, TC-H01-NEG-001 | Haowei | Pending |
| FR-INT-003 | H02 | TC-H02-POS-001/002, TC-H02-NEG-001 | Xuanyu | Pending |
| FR-PRIV-001 | H03 | TC-H03-POS-001, TC-H03-NEG-001 | Peiqing | Pending |
| FR-HUM-001 | H04 | TC-H04-POS-001, TC-H04-NEG-001 | Xuanyu | Pending |
| FR-HUM-002 | H05 | TC-H05-POS-001, TC-H05-NEG-001 | Xuanyu | Pending |
| FR-FACT-001 | H06 | TC-H06-POS-001, TC-H06-NEG-001 | Haowei | Pending |
| FR-CONF-001 | H07 | TC-H07-POS-001, TC-H07-NEG-001 | Haowei | Pending |
| FR-PERF-001 | H08 | TC-H08-POS-001, TC-H08-NEG-001 | Haowei | Pending |

## File Index
- tests/hazards/H01_negative_TC-H01-NEG-001.json
- tests/hazards/H01_positive_TC-H01-POS-001.json
- tests/hazards/H01_positive_TC-H01-POS-002.json
- tests/hazards/H02_negative_TC-H02-NEG-001.json
- tests/hazards/H02_positive_TC-H02-POS-001.json
- tests/hazards/H02_positive_TC-H02-POS-002.json
- tests/hazards/H03_negative_TC-H03-NEG-001.json
- tests/hazards/H03_positive_TC-H03-POS-001.json
- tests/hazards/H04_negative_TC-H04-NEG-001.json
- tests/hazards/H04_positive_TC-H04-POS-001.json
- tests/hazards/H05_negative_TC-H05-NEG-001.json
- tests/hazards/H05_positive_TC-H05-POS-001.json
- tests/hazards/H06_negative_TC-H06-NEG-001.json
- tests/hazards/H06_positive_TC-H06-POS-001.json
- tests/hazards/H07_negative_TC-H07-NEG-001.json
- tests/hazards/H07_positive_TC-H07-POS-001.json
- tests/hazards/H08_negative_TC-H08-NEG-001.json
- tests/hazards/H08_positive_TC-H08-POS-001.json

