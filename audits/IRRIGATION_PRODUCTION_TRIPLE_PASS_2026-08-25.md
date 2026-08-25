# TAGRO Irrigation — Production Triple-Pass Audit

Date: 2026-08-25
Branch: `iteration-06-plain-production`
Audit baseline: `2866d476caa0002d7838f440b373a8718db56d2e`
Status: ACTIVE — production acceptance not yet granted

## Purpose

Every production surface is inspected three times under different criteria before it can be called ready. A page that merely renders is not considered production-ready.

Primary production surfaces:
1. Information
2. Field
3. Drawing
4. Adviser
5. Design
6. Materials

Direct-address compatibility surfaces are also checked so an old URL cannot become an untested error path:
- `field-map.html`
- `spatial-drawing.html`

## Pass 1 — Human-use

Criteria:
- normal operational wording
- page title and task clarity
- visual hierarchy
- placement and available work area
- desktop and mobile usability
- touch and keyboard access
- navigation consistency
- command discoverability
- contextual vs permanent controls
- density and unnecessary presentation
- accessibility, focus and zoom behaviour
- no decorative or AI-generated operational copy

## Pass 2 — System / integration

Criteria:
- correct page routes
- one active job across all surfaces
- canonical Field/Drawing geometry
- explicit network relationships
- Information context integration
- Adviser context assembly
- deterministic engineering integration
- Design projection from canonical state
- Materials projection from Design/canonical state
- local persistence
- anonymous cloud persistence contract
- database create/read/save/conflict paths
- product knowledge and media mapping
- external map/search dependencies
- asset loading and rendering

## Pass 3 — Failure / resilience

Criteria:
- browser console and page errors
- missing local assets and broken links
- failed external libraries/tiles/search/GPS
- reload and navigation recovery
- back/forward behaviour
- empty and partial job states
- API/AI unavailable behaviour
- offline/local-save behaviour
- persistence conflicts
- localStorage failure handling
- horizontal/viewport overflow
- desktop and phone viewport acceptance
- stale compatibility routes
- regression test coverage

## Severity

- **P0** — can corrupt/lose project truth or make a primary page unusable.
- **P1** — important production defect or misleading integration state.
- **P2** — usability, wording, resilience or coverage defect that should be closed before production acceptance.
- **DEFERRED** — known unfinished capability which is not represented as complete in the UI and does not block the current usable scope.

# Findings ledger

| ID | Pass | Surface / subsystem | Severity | Finding | Status | Acceptance condition |
|---|---|---|---|---|---|---|
| TP-001 | Human | Field / Drawing | P1 | Permanent command ribbon exposes too many tools and runs beyond the useful desktop width. | OPEN | Frequent tools fit without page-level horizontal overflow; less-used tools remain available under All tools. |
| TP-002 | Human | Information | P2 | Several source labels are rewritten only after JavaScript runs (`Application thought`, `Known device`, `Known discharge`, `Actual plants / devices`), allowing stale wording/flicker before enhancement. | OPEN | Source HTML/render template uses production wording directly; enhancement no longer needed for label correction. |
| TP-003 | Human | Information | P2 | Information still opens with presentation-heavy hero/summary and progressive DOM surgery instead of a plain operational form. | OPEN | Initial page is stable, compact and task-first; optional groups remain reachable without post-render visual jump. |
| TP-004 | Human | Adviser | P2 | Initial Adviser wording is conversational/creative rather than standard operational copy; title is `Design Adviser` while page identity is `Adviser`. | OPEN | Standard title and short factual instruction only. |
| TP-005 | Human | Workbench + compatibility | P2 | `user-scalable=no` prevents browser zoom on field/drawing pages. | OPEN | Browser zoom is not disabled. |
| TP-006 | Human | Product reference | P2 | Visible product deck contains only three image-backed references while page wording can imply a complete Jain catalogue. | OPEN | Page explicitly identifies the view as selected/available references; missing product images are not represented as complete coverage. |
| TP-007 | Human | Field | P2 | Blank Field defaults to a broad Kerala regional view, which is not an immediate field-working scale. | OPEN | Existing geometry fits automatically; blank state gives a clear Search/Locate path without implying a field location. |
| TP-008 | System | Workbench | P1 | `workbench-v2.js` relies on compatibility shims for omitted `lineCoords()` and stale `updateInspector()` call. | OPEN | Own source contains the correct helper/call; runtime guard is only an external-library guard. |
| TP-009 | System | Canonical network | P0 | Network parentage is primarily stored as `properties.network.parent_id` while canonical `relationships` may remain empty/stale. | OPEN | Parent changes maintain an explicit canonical relationship and normalization repairs older parent-only state without changing geometry. |
| TP-010 | System | Adviser geometry acceptance | P0 | Deterministic generated laterals/submains record `generated_from` but do not necessarily become explicit children of their main/submain anchor. | OPEN | Accepted generated network objects have canonical parent relationship to their anchor. |
| TP-011 | System | Design | P1 | Base Design can show `Map/measurement adapter not bound yet` even though canonical map/measurement exists; canonical review can also be overwritten by later legacy `renderDesign()` calls. | OPEN | Canonical state always wins when present; zero-state wording reports no mapped geometry rather than missing adapter. |
| TP-012 | System | Materials | P1 | Materials can be overwritten by the legacy in-memory environment projection rather than canonical spatial review. | OPEN | Canonical projection always wins when canonical objects exist. |
| TP-013 | System | Cloud job envelope | P0 | Cloud state envelope saves spatial/composition/learning but omits customer/site/water/plot Information state. | OPEN | Envelope includes `TAGROJobInfo` state for the same job ID. |
| TP-014 | System | Cloud recovery | P1 | Worker/D1 supports GET job state but browser client has no restore/recovery path. | DEFERRED | Before cloud persistence is enabled for production, remote read/restore and version reconciliation are implemented and tested. |
| TP-015 | System | D1 binding | P1 | `IRRIGATION_DB` is not bound in current Worker config; cloud save must remain local-only. | DEFERRED | D1 binding/migration is explicitly enabled and runtime-tested before UI may say cloud persistence is available. |
| TP-016 | System | Workbench shell | P2 | Deliverable/configuration UI is injected into an old hidden topbar and is effectively inaccessible under the production shared shell. | OPEN | Configuration is either moved into the shared shell/All tools or removed from the production path without losing underlying configuration state. |
| TP-017 | System | Adviser state | P2 | Full Adviser conversation/proposal presentation state is in memory; reload/navigation does not restore the conversation. | DEFERRED | Conversation/proposal state is persisted with the job if production scope requires session continuation. |
| TP-018 | System | Product assets | P2 | Product image coverage is partial; only three current image assets are mapped for the visible deck. | DEFERRED | Product reference UI clearly states available coverage; full library ingestion is separately completed and source-verified. |
| TP-019 | Failure | Map dependencies | P1 | Primary Field depends on Leaflet/Geoman from `unpkg.com`; library failure is guarded but dependency remains external. | OPEN | Automated failure test proves the page does not crash or lose saved state when map libraries fail; packaging locally may follow. |
| TP-020 | Failure | Search / GPS | P2 | Map search and geolocation failures can be silently swallowed. | OPEN | Failure gives a concise visible status and leaves current job intact. |
| TP-021 | Failure | localStorage | P1 | Critical local stores write directly to localStorage without a common visible failure path for quota/private-mode exceptions. | OPEN | Save failure is caught and surfaced; no UI says saved after write failure. |
| TP-022 | Failure | CI | P1 | Existing regression covers desktop six-surface smoke + functional Field/Drawing, but not mobile, overflow, canonical Design/Materials, product image load, compatibility URLs, Adviser context, or degraded dependencies. | OPEN | Triple-pass automated gate covers these cases and runs on production branch changes. |
| TP-023 | Failure | Compatibility pages | P2 | `field-map.html` and `spatial-drawing.html` remain directly addressable with separate presentation and old `Device` wording. | OPEN | Direct pages either pass no-error compatibility checks with current wording/accessibility or are deliberately retired later with explicit authorization. |
| TP-024 | Documentation | README / STATUS | P2 | Environment README/STATUS describe earlier state and contradict currently verified map, engineering and regression behaviour. | OPEN | Documentation is updated only after current corrective batches pass. |

# Current verified baseline

At baseline commit `2866d476caa0002d7838f440b373a8718db56d2e`:
- six-surface browser gate passed;
- functional page-set gate passed;
- current production branch remains staging/work-in-progress;
- this audit found defects not covered by those two gates, therefore their PASS result is necessary but not sufficient for production acceptance.

# Correction order

## Batch A — Core/integration
Close TP-008, TP-009, TP-010, TP-011, TP-012, TP-013 and TP-016 first. These affect truth, topology, canonical projections or persistence.

## Batch B — Human-use
Close TP-001, TP-002, TP-003, TP-004, TP-005, TP-006 and TP-007 without changing the working engines.

## Batch C — Failure hardening and expanded gates
Close TP-019, TP-020, TP-021, TP-022 and TP-023. Re-run desktop/mobile visual evidence after this batch.

## Production acceptance rule

No page is called production-ready until:
1. all P0 findings are FIXED;
2. all in-scope P1 findings are FIXED;
3. P2 findings are fixed or explicitly accepted/deferred;
4. browser smoke, functional and triple-pass gates all pass;
5. final desktop and mobile screenshots are visually inspected;
6. no production deployment is performed without explicit owner approval.
