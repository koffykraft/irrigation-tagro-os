# TAGRO Irrigation Environment Regression Audit — 2026-08-25

Status: WORKING AUDIT / STAGING ONLY

## Scope

This audit was started after the shared application shell introduced visible regressions, including continuous flicker and a Field map that did not reliably render. The instruction is to inspect the whole environment as a system before further page redesign.

Primary user surfaces under audit:

1. Information — `app/environment-v1/info.html`
2. Field — `app/environment-v1/workbench.html?view=field`
3. Drawing — `app/environment-v1/workbench.html?view=drawing`
4. Adviser — `app/environment-v1/index.html#adviser`
5. Design — `app/environment-v1/index.html#design`
6. Materials — `app/environment-v1/index.html#materials`

Compatibility / older spatial surfaces also checked:

- `app/environment-v1/field-map.html`
- `app/environment-v1/spatial-drawing.html`

## What has been read / traced

The current branch head and recursive repository tree were inspected. All local files referenced by the three primary HTML shells exist in the branch. The Worker route was inspected and still hands non-API requests to the configured static asset binding.

The following current page/runtime files were read or traced for this audit:

- `info.html`
- `info-field-ux.js`
- `info-advanced-ux.js`
- `product-deck.js`
- `job-info.js`
- `workbench.html`
- `workbench-v2.js` relevant map, drawing, selection, manipulation, lookup and initialization paths
- `workbench-shell.js` persistence/composition paths
- `workbench-desktop-ux.js`
- `workbench-info-entry.js`
- `shared-shell.js`
- `shared-shell.css`
- `index.html`
- `environment.js` surface switching / initialisation paths previously read and re-traced where relevant
- `environment-learning-bridge.js`
- `environment-spatial-review.js`
- `field-map.html`
- `spatial-drawing.html`
- `cloudflare-ai/src/index-compatible.ts`
- `cloudflare-ai/src/index.ts` routing / asset fallback
- `cloudflare-ai/wrangler.jsonc`

## Confirmed findings

### R1 — Continuous repaint loop in old desktop UX layer

`workbench-desktop-ux.js` observes the Workbench status element and then unconditionally writes `status.textContent` inside the observer callback. Writing the observed node can retrigger the observer even when the displayed value is effectively unchanged. A similar risk exists for inspector metadata writes.

Consequence: continuous DOM mutation/repaint/high CPU and visible flicker.

Correction: retire the superseded generated desktop bars/observer layer from the active Workbench and preserve only its useful direct keyboard/double-click controls in a small event-only module with no DOM rewrite observers.

### R2 — Shared-shell polling caused unnecessary repeated header writes

The first shared shell polled job/save state every 1.2 seconds. This has already been removed in the branch and replaced with event-driven updates plus change-before-write guards.

Consequence before correction: repeated fixed-header repaint and potential visible flicker.

### R3 — Leaflet map size is stale after shared-shell layout change

`workbench-v2.js` correctly calls `map.invalidateSize(false)` when switching back to Field, but the shared shell is inserted after Leaflet initialises and changes the fixed Workbench viewport height. That CSS layout change does not itself generate a browser resize event.

Consequence: blank, partially rendered or incorrectly tiled Field map after the new shell is installed.

Correction: after a real shell-height/layout change on Workbench, issue one resize event after layout settles so Leaflet recalculates its container. Do not poll or repeatedly invalidate.

### R4 — Workbench shared save state has an execution-order race

`workbench-shell.js` is a module script and is deferred. `shared-shell.js` was loaded as a normal classic script after the module tag, so the shared shell can initialise before the module creates `#tagroSaveIndicator`. The shared shell then has no save source to observe.

Consequence: the common header can remain at `Job active` instead of reflecting the real local/cloud save state.

Correction: on Workbench, load the shared shell as a module after `workbench-shell.js`, preserving module execution order. The shared header should display the existing save state rather than create another persistence implementation.

### R5 — Adviser proposal preview still exits the new Workbench

`environment-learning-bridge.js` sends a successful `Preview drawing` proposal to `./field-map.html?...`.

Consequence: the user leaves the shared application shell and enters an older standalone Field UI, restoring duplicate page identity/navigation and bypassing the current Workbench UX.

Correction: send proposal preview to the current Workbench Field surface. The proposal is already stored in the same canonical proposal store, so Workbench can render it without creating a second geometry truth.

### R6 — Old standalone Field/Drawing pages remain live parallel paths

`field-map.html` and `spatial-drawing.html` still contain their own headers, tool menus and navigation. They use the canonical spatial store, so their geometry is not a second data truth, but they are a second UI/navigation truth.

Consequence: inconsistent navigation and a route by which users can fall out of the common application shell.

Correction for this stability batch: stop new active flows from routing into these pages. Do not delete them yet; keep them as compatibility/reference surfaces until the unified Workbench passes acceptance.

### R7 — Root/default routing happens on the client

Bare `index.html` is currently redirected to Information by the shared-shell client code. The Worker itself still serves the asset first.

Consequence: a visible intermediate surface is possible on slow load. Explicit Adviser/Design/Materials hash links also initialise the old default Field DOM before the shared shell switches surface, which can produce a one-time flash.

Correction: serve `/` as Information at the Worker compatibility layer. Keep explicit Adviser/Design/Materials deep links. Treat any remaining single-load surface flash separately from continuous flicker.

### R8 — Map runtime depends on external libraries without a visible failure state

Workbench and the older Field map load Leaflet and Leaflet-Geoman from `unpkg.com`; Geoman is requested as `@latest`. `workbench-v2.js` silently exits if `window.L` is unavailable.

Consequence: if the CDN/library fails, the user sees a blank map with no explanation; `@latest` can also change independently of this repo.

Correction: for this batch add a visible runtime failure guard and pin dependency versions. Local vendoring can be a later deployment-hardening step after the current regression is closed.

### R9 — Information → Measure on map works only as a general measurement handoff

`info-field-ux.js` opens the current Workbench with `measure=all`, and `workbench-info-entry.js` activates the Ruler. The optional `plot` query parameter is not yet mapped to a particular canonical Boundary/Plot object.

Consequence: measurement opens and is useful, but a particular INFO Plot is not automatically identified with a particular mapped object.

Status: known honest boundary, not a regression introduced by the shared shell.

### R10 — Current local navigation endpoints are otherwise present

Primary shared-shell destinations exist:

- Information → `info.html`
- Field → `workbench.html?view=field`
- Drawing → `workbench.html?view=drawing`
- Adviser → `index.html#adviser`
- Design → `index.html#design`
- Materials → `index.html#materials`

Product card Field action currently points to `workbench.html`; Product/Adviser links point to the current Information/Adviser surfaces.

## Tool endpoint trace — Workbench

The current Workbench handlers exist for:

- Select
- Boundary
- Plot
- Section
- Crop area
- Path
- High point
- Low point
- Water source
- Pump
- Tank
- Main
- Submain
- Lateral
- Plant
- Device
- Ruler
- Layout Laterals
- Multi-select
- Same type
- Move / drag move / nudge
- Edit shape / Geoman vertex edit
- Rotate / align parallel
- Duplicate
- Delete
- Connect / clear parent
- Details / object properties
- Emitter/application data
- Product evidence lookup
- Search place / coordinates
- Browser geolocation
- Proposal preview / accept / clear

The audit has not accepted browser rendering of each tool yet. This list means the handler path exists in code; runtime acceptance still requires the regression smoke gate below.

## Stability repair batch

The next code change is one grouped stability batch, not isolated visual patches:

1. remove the superseded observer-based desktop UI runtime and replace it with event-only direct keyboard/double-click controls;
2. make Workbench shared-shell execution follow the composition/save module;
3. issue one Workbench resize notification after real shell layout changes;
4. route Adviser proposal preview into Workbench Field;
5. make `/` resolve to Information before the application UI renders;
6. add a visible map-library runtime failure state and pin the Geoman dependency version;
7. add an automated page/render/navigation smoke gate covering all six primary surfaces.

## Acceptance gate after repair

Do not proceed to the next UI redesign phase until all of the following pass together:

- no continuous flicker with no user input;
- Information loads and saves without repeated repaint;
- Field loads map tiles and canonical geometry;
- Field ↔ Drawing changes view without losing job state;
- all shared navigation tabs land on the intended surface;
- Adviser has no Field-only chip/menu leakage;
- Adviser `Preview drawing` opens the current Workbench Field preview;
- Design and Materials display the same job/canonical state;
- selection, multi-selection and primary manipulation handlers still exist after retiring the old desktop observer layer;
- no local CSS/JS route referenced by a primary page is missing;
- browser console smoke test reports no uncaught application error on the six primary surfaces.

Until that gate passes, Phase 2 visual redesign is blocked.
