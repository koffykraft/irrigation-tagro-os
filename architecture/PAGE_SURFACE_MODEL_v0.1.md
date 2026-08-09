# TAGRO Irrigation OS — Page Surface Model v0.1

Status: WORKING

## 1. Page is a surface, not a silo

A page is one temporary planar view over shared state. It owns no farm truth, hydraulic truth or material truth.

A page may show, edit or interpret information owned by the shared model, but removal of the page cannot delete that information.

## 2. Composition hierarchy

`Application Shell → Page Manifest → Zones → Docks → Controls / Views`

Each level is replaceable.

### Application Shell
Provides navigation, common actions, context, safe-base recovery and composition loading.

### Page Manifest
Declares label, purpose, default order, visible zones and dock membership.

### Zones
Suggested generic zones:
- `primary`
- `secondary`
- `context`
- `sidebar-left`
- `sidebar-right`
- `drawer`
- `overlay`
- `footer`

Zones may be hidden, resized, reordered or projected differently on mobile.

### Docks
Reusable functional or informational units registered by stable ID and contract.

### Controls / Views
Buttons, fields, map tools, selectors, metrics, lists, diagrams and other small elements. These too should rely on shared tokens/contracts and not own business state.

## 3. Dock contract

Every dock should declare at minimum:
- stable ID
- title/role
- state paths it reads
- state paths/events it can write
- dependencies it may trigger
- adapter dependencies, if any
- allowed sizes
- allowed zones
- provenance/status behaviour
- fallback behaviour if an adapter fails

A dock may have multiple renderers, e.g. compact, full, mobile, print, review.

## 4. Planar reuse

The same state can appear in multiple planes without copying truth.

Example: `water.source.yield` may appear in:
- Water / Power as an observation,
- Network Design as a constraint,
- Hydraulics as an input,
- Review as an evidence-status item,
- History as event lineage.

Those are views of one fact/event chain, not five records.

## 5. Mothership rule

The shell remains operational even when a dock or provider fails. Map, elevation, weather, AI interpretation, catalogue, pricing, database sync and reporting are detachable capabilities.

A failed dock should leave a recoverable boundary and context, not collapse unrelated work.

## 6. Flux rule

Page composition, dock placement and visual treatment are expected to change. Their configuration is versioned. A redesign should preserve underlying state and event history wherever contracts remain compatible.

## 7. Event / Ripple rule

UI actions that change information emit events. Layout-only actions emit layout events. Domain dependency rules determine ripple; page membership does not.

## 8. Shadow rule

A reusable UI/architecture failure may register a Shadow family. Before adopting a new pattern, compare against existing Shadows. Similar recurrence adds evidence to the same family.

## 9. Replaceability examples

- Replace map library without rewriting plot objects.
- Replace tile/button styling without altering events.
- Replace left sidebar with bottom sheet on mobile.
- Move pump controls from Water / Power to Network Design without moving pump truth.
- Split Field / Map into Map and Sketch while both use the same geometry objects.
- Replace a hydraulic renderer while retaining the hydraulic calculation contract.

## 10. Smallest-element rule

Planar/Mothership thinking applies down to buttons and fields. A button should invoke a declared command/event; it should not hide unrelated logic. A field is a view/editor of a state path with provenance, not a private value embedded in a page.
