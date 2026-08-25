# TAGRO Irrigation UI/UX Correction Plan — 2026-08-25

Status: WORKING / STAGING ONLY

Purpose: correct the irrigation SaaS as one coherent operating environment. Changes are to be delivered in grouped phases, not as isolated one-off patches. Existing working geometry, persistence, calculations, IDs, workflows and source relationships are to be preserved unless a phase explicitly changes them.

## Design principles admitted

Use only the parts that improve the irrigation product:

- One application identity and one current-job identity across all surfaces.
- Navigation must be consistent, simple and clear.
- The work itself gets the largest uninterrupted area.
- Common commands live in stable, predictable positions.
- Contextual commands appear when the object/page makes them relevant.
- Prefer direct manipulation of field/drawing objects to indirect forms and modal command chains.
- Use progressive disclosure: common information/actions first; advanced detail remains discoverable but does not crowd the ordinary task.
- Desktop and mobile share product identity and job state, but may use different compositions.
- Responsive design may reflow, show/hide or re-architect; do not merely shrink desktop UI onto a phone.
- Page titles and descriptions use ordinary industry/software language. No decorative AI prose, architectural exposition or invented marketing language on operational pages.
- Save/sync/persistence state must be visible without dominating the workspace.
- Do not duplicate state between surfaces. FIELD, DRAWING, ADVISER, DESIGN, MATERIALS and INFORMATION are projections of the same job.

## Current problems to correct

1. Root/index currently defaults to Adviser rather than a neutral project/job entry.
2. Shared shell is too tall and consumes excessive work area.
3. Page identity is repeated: app shell + ribbon page label + large in-page heading.
4. Field tool state can remain visible on Adviser/Design/Materials (for example active Main tool chip).
5. Header, navigation and tool placement are not yet one fully proven system.
6. Workbench tool access still has duplicated surfaces and legacy remnants.
7. Selection/manipulation controls need one consistent contextual command system.
8. Measurements/labels/selection information compete with actions in the lower-right inspector.
9. Information form remains denser than necessary in places; advanced information should be optional/disclosed.
10. Product presentation needs conventional catalogue hierarchy and restrained image scale.
11. Adviser, Design and Materials still need ordinary page wording and denser, more standard layouts.
12. Mobile has not yet been accepted and must not be treated as desktop reduced in size.
13. Cross-page persistence/navigation/save state requires end-to-end browser acceptance.

## Phase 1 — Application frame and navigation

Batch goal: make the OS visibly one application before improving individual work surfaces.

- Root landing/default route -> INFORMATION / project start unless a specific destination is requested.
- Compact app header: TAGRO Irrigation + current job + save/sync state.
- One page navigation row: Information | Field | Drawing | Adviser | Design | Materials.
- Context toolbar directly below navigation; no duplicate page-name block consuming a third row.
- Remove repeated large page identity where the active tab already identifies the surface.
- Suppress Field/Drawing-only active-tool chips and work controls on Adviser/Design/Materials.
- Keep existing page controls in DOM as functional sources while the shared shell proxies them.
- Preserve back/forward and explicit deep links (#adviser, #design, #materials, ?view=drawing).

Acceptance gate:
- Root opens Information.
- Explicit Adviser/Design/Materials links still open their requested destination.
- Page tab highlight always matches visible surface.
- No Field tool chip on Adviser/Design/Materials.
- Header height is materially smaller than the current 94 px desktop shell.
- No function loss in Field/Drawing tools.

## Phase 2 — Field and Drawing interaction

Batch goal: make map/drawing manipulation behave like a familiar desktop design tool while preserving canonical geometry.

- Persistent compact work toolbar for common tools; More only for uncommon tools.
- Ctrl/Shift+click additive selection; Alt+click same type; keyboard shortcuts documented and consistent.
- Group multi-select supports move, rotate, duplicate, delete, connect and details where valid.
- Selected single objects expose drag/move and visible edit/resize handles.
- Boundary/plot corners and line vertices are directly adjustable.
- Inspector becomes information/measurement/relationship display; actions move to contextual toolbar.
- Measurements and labels use consistent readable sizing/placement.
- Repeated tool usage remains active until Finish/Stop where appropriate.
- Existing V16 useful functions are reviewed and admitted as raw material, not copied wholesale.

Acceptance gate: desktop interaction test with boundary, main, multiple submains/laterals, group selection, move/resize/rotate, duplicate/delete, Field<->Drawing identity.

## Phase 3 — Information / project entry

Batch goal: ordinary project entry with progressive disclosure and map-assisted measurement.

- Common facts first; advanced fields behind More details.
- Measure on map uses the same job and visibly returns measured values when relationship is explicit.
- Length x width derives approximate area; manual area remains possible when side dimensions are unknown or irregular.
- Standard wording: Irrigation method; Emitter/sprinkler model; Emitter/sprinkler discharge; Water source to field distance; etc.
- Customer/site sections optional/collapsible.
- Remove explanatory option cards from ordinary reading path.
- Advanced tools remain discoverable through compact actions.

Acceptance gate: new-user entry, partial-data entry, map-measure handoff, save/reload, multi-plot entry.

## Phase 4 — Adviser / Design / Materials normalization

Batch goal: make these normal software pages, not presentations.

- Short standard page titles.
- Formal descriptions only where they help the task.
- Remove artistic/AI-created headings and unnecessary explanatory prose.
- Adviser is a tool, not the OS landing page.
- Design shows current measurements/checks/unknowns compactly.
- Materials shows requirements first; product identity, verified price/stock/source separately.
- Product help/advice is optional and does not replace factual product information.

Acceptance gate: compare pages side-by-side for common identity, density, wording and navigation.

## Phase 5 — Product / sales experience

Batch goal: useful SaaS sales path without catalogue overload.

- Conventional category/product hierarchy.
- Small consistent product media area, clear name, short factual description, key specs.
- Details/comparison on demand.
- Jain/TAGRO/generic identity and price source remain explicit.
- Crop/application exploration can lead to Try on field / Use in project, but product interest never becomes accepted engineering automatically.
- Quotation/buy selected/all materials follows accepted design and verified commercial data.

Acceptance gate: product browse, compare, try-on-field, materials handoff, quote path.

## Phase 6 — Mobile composition

Batch goal: first-class phone workflow, not desktop shrunk to fit.

- Compact app/job header.
- Page switcher appropriate to phone width.
- Context tools as reachable strip/sheet with large touch targets.
- Drawing/map dominates viewport.
- No hover dependency.
- Panels become sheets/drawers where appropriate.
- Save/sync visible but quiet.

Acceptance gate: actual phone screenshots and interaction for Information, Field, Drawing, Adviser, Design, Materials.

## Phase 7 — Persistence and end-to-end acceptance

- Same job survives every page transition.
- Browser back/forward behaves correctly.
- Local save and optional cloud persistence states remain explicit.
- No duplicate truth between Information, canonical spatial store, Adviser, Design or Materials.
- Desktop + mobile acceptance matrix.
- No production deployment until acceptance.

## Rule for execution

Implement and review complete phases. Do not chase individual visual defects with isolated patches unless a defect blocks the current phase acceptance gate.
