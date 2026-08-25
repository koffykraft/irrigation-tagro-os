# TAGRO Irrigation OS — Total Configurable System Skeleton v1.0

Status: WORKING ARCHITECTURE. This defines the complete structural picture; it does not by itself declare every adapter runtime-verified or production-approved.

## 1. Purpose of the picture

The system is not a collection of pages.

It is one persistent irrigation job that can be viewed, edited, checked and delivered in different ways as the farmer's or designer's need changes.

The governing picture is:

`NEED / PURPOSE → DELIVERABLE PROFILE → SURFACES → CAPABILITIES → SHARED JOB TRUTH → PERSISTENCE / HISTORY`

A quick feasibility visit, a detailed network design, a material estimate, a purchase list and an installed-system record may look very different on screen. They must nevertheless remain projections of the same underlying job wherever the underlying facts are the same.

The purpose therefore controls composition. Composition must never become a second source of truth.

## 2. The five structural layers

### 2.1 Truth layer

Owns the persistent reality of the job:

- job identity and maturity;
- field / plot / crop-area / path / water / pump / tank objects;
- main / submain / lateral / device objects;
- canonical real-coordinate geometry;
- explicit relationships;
- evidence and provenance;
- accepted/described/installed state;
- events and revision lineage.

Pages, buttons, toolbars and screen layouts own none of this.

### 2.2 Decision layer

Owns what is still being considered:

- questions;
- unknowns;
- proposals;
- alternatives;
- acceptance / rejection / modification;
- farmer preferences;
- learning evidence.

This layer is deliberately separate from truth so that an AI suggestion, a layout preview or a product candidate cannot quietly become accepted design.

### 2.3 Derived layer

Owns repeatable projections from truth:

- line lengths;
- areas;
- inter-object distances;
- family spacing;
- hydraulic calculations;
- permissible lengths;
- operating sections and runtime;
- BOM requirements;
- product matches;
- pricing/cost projection.

A derived result carries source/engine/version. If the canonical input changes, the appropriate result is recalculated or invalidated rather than copied forward as stale truth.

### 2.4 Composition layer

Owns the configurable picture:

- which surfaces are visible;
- surface order;
- zones/docks;
- tool grouping and order;
- inspector actions;
- measurement-label visibility;
- map/drawing renderer choice;
- adviser placement;
- detail depth;
- mobile/desktop projection;
- export renderer/template.

It may change freely within the contracts without rewriting job truth.

### 2.5 Session layer

Owns temporary interaction only:

- current selection;
- open panel;
- active drawing tool;
- map zoom/view;
- unaccepted preview;
- temporary draft geometry.

This is not project truth and may disappear without corrupting the job.

## 3. The system is assembled from capabilities, not pages

A capability is a functional piece with explicit reads, writes, dependencies and fallback behaviour.

Current / required capability families are:

1. **Capture** — purpose, description, photo/map/drawing/measure/choice, reflection and correction.
2. **Field Geometry** — draw/edit real-coordinate objects.
3. **Drawing Projection** — engineer the same objects in a clean drawing view.
4. **Selection & Transformation** — one/many select, move, rotate, duplicate, edit points, label.
5. **Relationship Editor** — explicit parent/connectivity and other spatial/functional relationships.
6. **Measurement** — length, area, coordinate, spacing, shortest distance and future surveyed/elevation evidence.
7. **Repeated Layout** — preview/create laterals or other repeated families from explicit anchors.
8. **Application Device** — dripper, jet, micro/mini sprinkler, bubbler, mister, fogger etc., with evidence.
9. **Adviser** — understand, ask, compare and propose.
10. **Engineering** — deterministic hydraulic and permissible-length checks.
11. **Materials** — design quantity, accepted quantity, procurement quantity, product/price resolution.
12. **Persistence** — local-first plus anonymous cloud job.
13. **History** — event, decision, correction, supersession and junction lineage.
14. **Export** — field sheet, checked design, BOM, purchase list, print/PDF and later installation/service outputs.

A page/surface assembles these pieces. It does not own them.

## 4. Working surfaces

### FIELD

Purpose: face physical reality.

Primary pieces:

- map;
- canonical objects;
- drawing/edit tools;
- selection;
- labels;
- measurements;
- explicit connections;
- field evidence;
- proposals as visible previews only.

### DRAWING

Purpose: a clean engineering projection.

The drawing must use the same IDs and same canonical coordinates as FIELD. It is not an exported image or recreated sketch.

Primary pieces:

- canonical object projection;
- multi-select;
- move/rotate/duplicate/edit;
- measurements and spacing;
- network relationships;
- repeated layout;
- device/application properties.

### ADVISER

Purpose: understand the job and help decide what is worth doing next.

Primary pieces:

- conversation;
- farmer meaning and corrections;
- relevant evidence;
- deterministic results already available;
- manufacturer/product evidence;
- proposals;
- next consequential question.

The Adviser is not geometry authority and is not hydraulic authority.

### DESIGN

Purpose: show what the design knows, what it does not know, what passes, what still needs checking, and current maturity.

Primary pieces:

- network summary;
- canonical measurements;
- engineering status;
- hydraulic checks;
- assumptions / unknowns;
- operating logic;
- proposal/acceptance state.

### MATERIALS

Purpose: turn accepted/provisional network requirements into material requirements without letting catalogue choice decide engineering truth.

Primary pieces:

- design quantity;
- accepted quantity;
- procurement quantity;
- accessories;
- product candidates;
- manufacturer evidence;
- price edition / availability;
- alternatives;
- BOM / purchase output.

### REVIEW

Purpose: show the whole decision state rather than forcing the user to remember which page contains what.

Primary pieces:

- current maturity;
- known vs unknown;
- unresolved checks;
- proposals and decisions;
- ripple / affected items;
- important consequences;
- export readiness.

### HISTORY

Purpose: make work recoverable and auditable.

Primary pieces:

- state revisions;
- events;
- changes;
- corrections;
- accepted/rejected proposals;
- superseded states;
- installed/service observations later.

## 5. Deliverable profiles: the picture changes with the need

A deliverable profile is a configuration, not a new application.

### Field Capture

Purpose: record enough real field information to support later work.

Typical visible surfaces: FIELD → ADVISER → REVIEW.

Does not need to force hydraulics, products or BOM.

### Quick Feasibility

Purpose: give useful direction with honest uncertainty.

Typical visible surfaces: FIELD → ADVISER → DESIGN → REVIEW.

### Network Concept

Purpose: create and compare an editable physical network concept.

Typical visible surfaces: FIELD ↔ DRAWING → ADVISER → DESIGN → REVIEW.

### Checked Design

Purpose: hydraulically check an explicit design and record maturity.

Typical visible surfaces: FIELD ↔ DRAWING → DESIGN → MATERIALS → REVIEW → HISTORY.

### Material Estimate

Purpose: project material quantities from the current design.

Typical visible surfaces: DRAWING → DESIGN → MATERIALS → REVIEW.

### Purchase List

Purpose: resolve accepted quantities into procurement quantities/products/prices.

Typical visible surfaces: MATERIALS → REVIEW → HISTORY.

### Installed Record

Purpose: preserve what was actually installed and later changed/serviced.

Typical visible surfaces: FIELD ↔ DRAWING → REVIEW → HISTORY.

The same job may move through several of these profiles over time. Earlier information is not discarded merely because the current picture is different.

## 6. Joins — how the pieces form one picture

### Need → deliverable profile

The current task determines what needs to be visible and what evidence is worth asking for.

No universal page sequence is required.

### Deliverable profile → surfaces

Only useful surfaces need to be shown. Hidden surfaces remain available as projections and do not lose underlying data.

### Surface → capabilities

A surface is a composition of capabilities.

Example: DRAWING may use geometry projection + selection + measurement + relationship editor + repeated layout.

### Capability → shared stores

Every capability declares what it reads and writes. Hidden direct coupling is rejected.

### FIELD ↔ DRAWING

This is the most important visual join:

`B1 on FIELD = B1 on DRAWING`

`M1 on FIELD = M1 on DRAWING`

`S1 on FIELD = S1 on DRAWING`

Changing the geometry changes the canonical object. Both surfaces then re-render it.

### Geometry → measurement

Lengths/areas/spacings are projections from canonical coordinates. Measurement visibility is configurable; the source calculation is not.

Measurements should be able to appear:

- on selection;
- persistently on all relevant lines/areas;
- as an optional ruler between objects;
- as family spacing;
- in DESIGN;
- in MATERIALS;
- in print/export.

### Relationship → engineering

Network hierarchy must come from an explicit relationship such as:

`Water → Pump → Main → Submain → Lateral → Device`

Screen proximity or line crossing alone must not create hydraulic parentage.

### Engineering → materials

Engineering produces requirements/checks. MATERIALS consumes them.

A product choice cannot rewrite a hydraulic fact simply because a catalogue offers that product.

### Adviser → proposal → human acceptance → truth

The Adviser may propose:

- a geometry intent;
- an operating option;
- a product comparison;
- a lower-cost tradeoff;
- a convenience/future-expansion option.

That remains a proposal until explicitly accepted. Acceptance itself is an event.

### Mutation → event → save

Every meaningful job mutation creates or contributes to an event/revision. Persistence keeps the state recoverable.

## 7. Persistence is a structural requirement, not a Save button

The existing canonical spatial store already persists locally by `job_id` and revision. The Worker already contains an anonymous job API contract with versioned D1 snapshots.

The complete persistence path is:

`UI action → canonical state mutation → local save/revision → event → optional cloud sync → new cloud version`

Cloud job identity is independent of login.

The client holds a job capability token; the database stores only its hash.

Required visible save states are:

- **Saved locally · revision N**
- **Syncing**
- **Saved to cloud · version N**
- **Offline · local work safe**
- **Conflict · reconciliation required**

The system must never display “saved to cloud” merely because localStorage succeeded.

On a cloud state-version conflict, neither side may be silently discarded.

## 8. Configuration hierarchy

Configuration is layered so that a redesign or a different need does not fork the application.

Precedence:

`SYSTEM DEFAULT → TAGRO POLICY → JOB → DELIVERABLE → SURFACE → DEVICE → SESSION`

Examples:

### System default

- stable capability IDs;
- default colors/tokens;
- supported object kinds;
- persistence contracts.

### TAGRO policy

- preferred field tool groupings;
- standard BOM order;
- engineering acceptance rules;
- approved product evidence sources.

### Job

- chosen deliverable profile;
- visible measurement preference;
- farm/job-specific labels;
- job-specific access preferences.

### Deliverable

- which surfaces are needed;
- which checks must be visible;
- which export is offered.

### Surface

- zones;
- dock placement;
- compact/full renderer;
- visible tools.

### Device

- mobile/desktop projection;
- panel behaviour;
- touch target sizes;
- map vs drawing space allocation.

### Session

- selection;
- currently open panel;
- active tool;
- map zoom.

Session changes do not rewrite job configuration unless explicitly saved as a preference.

## 9. What may be configured

Configuration should be allowed for:

- deliverable profile;
- visible surfaces;
- navigation order;
- default surface;
- zones and dock placement;
- tool categories;
- tool order;
- tool visibility;
- inspector action set;
- measurement labels: off / selected / all / family / print;
- labels/names shown;
- map provider/renderer;
- drawing renderer;
- Adviser as surface/drawer/inline/disabled;
- engineering detail depth;
- MATERIALS columns and grouping;
- generic vs manufacturer product display;
- pricing adapter;
- export renderer/template;
- mobile projection.

Configuration must never be allowed to redefine:

- stable canonical object identity;
- event lineage;
- evidence provenance;
- accepted-vs-proposed distinction;
- deterministic engineering result provenance;
- manufacturer source evidence;
- unknown as a real unknown.

## 10. Existing pieces and where they fit

### Canonical pieces to build around

- `app/environment-v1/spatial-store.js` — current canonical spatial object/event store and local persistence.
- `app/environment-v1/workbench.html` + `workbench-v2.js` — current combined FIELD/DRAWING manipulation surface.
- `app/environment-v1/environment-learning.js` — job-local learning evidence.
- `app/environment-v1/spatial-proposal.js` — proposed geometry boundary.
- `app/environment-v1/environment-engineering.js` — deterministic engineering adapter.
- Worker engineering routes — calculation service.
- Worker product-knowledge dock — product evidence service.
- Worker anonymous-job routes — cloud-persistence contract.
- existing task profiles — need-specific information/surface requirements.
- existing capture primitives — configurable information-capture pieces.

### Transitional pieces

- `app/environment-v1/field-map.html`
- `app/environment-v1/spatial-drawing.html`

They demonstrate the canonical shared spatial store but are superseded structurally by a combined configurable Workbench once parity is verified.

### Legacy functional reference

- `location-map.html` / V16 modules.

Useful behaviours must be preserved or deliberately superseded, but this legacy persistence universe must not remain a parallel long-term job truth.

### Historical / design references

- old dockable app shell;
- vNext prototype;
- Iteration-01 prototype;
- reflective-capture prototype;
- reference/page-structure/engine-framework pages.

These are evidence and design sources, not primary navigation destinations in the eventual usable product.

## 11. Current structural gaps found by the page audit

1. More than one persistence universe still exists in the repository.
2. The Environment quick FIELD/DRAWING state is not the same in-memory model as canonical Workbench geometry.
3. Top-level `design.html` and `materials.html` still redirect to the legacy V16 map rather than the new shared environment.
4. Workbench canonical geometry is locally persistent, but the anonymous cloud persistence API is not yet wired into the browser Workbench.
5. Network parentage is currently also kept in `object.properties.network.parent_id`; the full model should converge on an explicit canonical relationship plane without losing compatibility.
6. Measurement calculation exists in several generations; the total system needs one measurement contract with configurable renderers.
7. Historical/reference pages need to be removed from ordinary working navigation rather than deleted blindly.

These are integration issues, not reasons to create another independent application.

## 12. Build sequence from this skeleton

The safest consolidation sequence is:

1. Keep `spatial-store` as the canonical spatial truth during migration.
2. Make Workbench the spatial capability host after its current V2 defects are corrected and verified.
3. Move navigation to a configuration manifest generated from the active deliverable profile.
4. Make ADVISER/DESIGN/MATERIALS consume the same canonical job instead of carrying a second quick-canvas truth.
5. Add visible save-state adapter: local revision + cloud job/version when D1 is available.
6. Consolidate measurement into one canonical measurement capability with multiple display modes.
7. Migrate network parentage into explicit relationships while preserving current property compatibility during transition.
8. Add REVIEW/HISTORY as real projections of the same events/state.
9. Redirect old Design/Materials URLs to the correct configured surfaces only after parity is verified.
10. Keep V16 as a deliberate fallback/reference until all required behaviour is proven in the new composition.

## 13. Acceptance tests for the total picture

The architecture is working only if these tests pass:

- draw `M1` in FIELD; it appears as `M1` in DRAWING without export/import;
- edit `M1` in DRAWING; FIELD changes from the same stored object;
- reload; the job reopens with the same objects and IDs;
- switch deliverable profile; hidden surfaces/tools change but objects do not;
- enable/disable measurement labels; geometry and measured values do not change;
- create a Submain/Lateral parent tie; engineering sees the same explicit relationship;
- AI proposal appears as proposed; it does not mutate accepted design until chosen;
- change geometry; length/BOM-derived projections update or mark stale;
- go offline; local work remains safe;
- reconnect; cloud sync does not silently overwrite a newer version;
- move from network concept to purchase list; the same job lineage survives;
- later identity/login can be added without replacing job IDs/history.

## 14. Machine-readable companion

The companion manifest is:

`app/config/system-skeleton.v1.0.js`

It defines layers, stores, capabilities, elements, surfaces, deliverable profiles, joins, configuration precedence, persistence contracts and the current assembly map.

That manifest is intended to become the source from which navigation and capability composition are generated, rather than continuing to hard-wire the entire application into individual HTML pages.
