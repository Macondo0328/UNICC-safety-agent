# UI Implementation Status - Xuanyu's Focus

**Updated:** 2025-10-27  
**Scope:** UI Integration for UNICC AI Safety Reviewer  
**Alignment:** PROJECT_GUIDELINES.md

## ✅ Completed (My UI Work)

### 1. Core UI Components
- **UNHeader** - UN-branded navigation header
- **SafetyReviewQueue** - Case queue with filtering (aligned with /cases requirement)
- **ReviewWorkspace** - Review panel with hazard display and decision chips (aligned with /cases/:id requirement)
- **TestRunner** - Pilot test runner with AI assistant (aligned with /pilot requirement)
- **LLMInterface** - LLM interaction interface
- Various supporting components (HazardDisplay, DecisionChips, ComplianceEvidenceDisplay, etc.)

### 2. TestRunner Enhancement (Recently Completed)
- ✅ AI agent selection dropdown (inside AI assistant interface)
- ✅ AI chat assistant with intelligent responses
- ✅ Test summary with conclusion (<150 words)
- ✅ Coverage tracking by hazard (H01-H08)
- ✅ Performance metrics (average latency, P95)
- ✅ Evidence export as JSON

### 3. Styling & Accessibility
- ✅ UN Blue color scheme implementation
- ✅ Responsive design
- ✅ CSS organized by component
- ✅ Focus on WCAG 2.1 AA compliance

## ⚠️ Pending (From PROJECT_GUIDELINES.md)

### Critical for UI Integration:

1. **Routing Structure** (Section 6)
   - Currently using tab-based navigation
   - Need: Implement React Router v6 with proper routes
   - Routes needed: `/cases`, `/cases/:id`, `/pilot`, `/coverage`, `/trace`, `/admin`

2. **Data Ingestion** (Section 5)
   - Need: Create `tools/ingest-acceptance.ts` → `public/data/acceptance-map.json`
   - Need: Create `tools/ingest-policy.ts` → `public/data/policy-tags.json`
   - Need: Set up `public/data/` directory structure

3. **OpenAPI Client Generation** (Section 3)
   - Need: Generate TypeScript client from `openapi.yaml`
   - Need: Create `src/lib/http.ts` for auth and trace ID
   - Need: Wire up to generated client

4. **Coverage Dashboard** (Section 7.4)
   - Missing: `/coverage` route and component
   - Need: Load `config/validation.metrics.yaml`
   - Need: Calculate coverage %, precision, recall, FPR, FNR

5. **Traceability View** (Section 7.5)
   - Missing: `/trace` route and component
   - Need: Load `public/data/traceability_seed.csv`
   - Need: Render Requirement → Hazard → Test mapping

6. **Admin Dashboard** (Section 7.6)
   - Missing: `/admin` route and component
   - Need: Live telemetry display
   - Need: Gating evaluation against validation metrics

7. **Accessibility Testing** (Section 11)
   - Need: Install `@axe-core/react`
   - Need: Add dev-time a11y checks

## 🎯 Next Steps (My Focus)

### Immediate (Today):
1. Set up proper routing with React Router v6
2. Create public/data directory structure
3. Install required dependencies for data ingestion

### Short-term (This Week):
1. Build data ingestion tools (acceptance-matrix, policy-mapping parsers)
2. Create Coverage Dashboard component (`/coverage`)
3. Create Traceability View component (`/trace`)
4. Create Admin Dashboard component (`/admin`)

### Medium-term (Next Week):
1. Integrate OpenAPI client generation
2. Wire up HTTP wrapper with auth and trace IDs
3. Implement proper API integration
4. Add @axe-core/react for accessibility testing

## 📝 Notes

- **Framework & AI Agent:** Other team members' responsibility (will be integrated later)
- **My Focus:** UI components, data ingestion, routing, dashboards
- **Alignment:** Keep aligned with overall project structure for smooth integration

## 🔗 Key Files

### Current Structure:
```
src/
├── components/          # UI components (completed)
├── services/           # Business logic (evidence, policy mapping)
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
├── styles/             # CSS styling
└── utils/              # Utility functions

Validation/
├── config/
│   └── validation.metrics.yaml  # ✅ Saved
└── [test files]        # Test cases (H01-H08)

```

### Needed Structure:
```
public/
└── data/
    ├── acceptance-map.json      # From acceptance-matrix
    ├── policy-tags.json         # From policy-mapping
    └── traceability_seed.csv    # Traceability mapping

tools/
├── ingest-acceptance.ts
└── ingest-policy.ts

src/
└── lib/
    ├── api/            # Generated OpenAPI client
    └── http.ts         # HTTP wrapper
```

## ✅ What's Working

- UI components are built and styled
- TestRunner has AI assistant and conclusion
- Evidence collection infrastructure exists
- Policy mapping service is implemented
- Test validation with H01-H08 coverage
- Export functionality (JSON)

## ⚠️ What Needs Work

- Routing system (tab-based → proper React Router)
- Data ingestion pipeline
- Coverage dashboard
- Traceability view
- Admin observability
- OpenAPI integration
- Accessibility testing setup

