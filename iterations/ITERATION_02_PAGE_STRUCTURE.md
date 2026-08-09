# TAGRO Irrigation OS — Iteration 02: Page Structure

Status: WORKING / PRIMER
Starting junction: `iteration-01`

## Project blind

This iteration defines the page/surface structure of the irrigation design system under TAGRO OS doctrine. It does not finish maps, hydraulics, BOM, database persistence, AI interpretation, catalogue integration, routing, or final styling.

## Objective

Create a page system in which page order, visibility, nesting, tool placement, sidebars, drawers and component grouping are configuration rather than hard-wired application logic.

The page is a temporary planar composition over shared farm/design state. It is never the owner of the facts shown on it.

## Default working surfaces

1. **Start / Job** — identity, purpose, existing information, open/new job.
2. **Farm Intelligence** — location, people, purpose, economics, labour, machinery, household constraints.
3. **Field / Map** — plots, boundaries, elevation, roads, buildings, water points, access, obstacles and evidence.
4. **Crop / Soil** — crop patches, plant count/spacing/age, soil and root-zone observations.
5. **Water / Power** — sources, availability, quality, pump, power, head, operating window.
6. **Application** — emitter/sprinkler choice, plant or area demand, wetting intent and operating pressure.
7. **Network Design** — source connection, main, field connections, submains, laterals, outlets and operating groups.
8. **Hydraulics** — demand, lengths, sizes, head loss, pressure checks, permissible lengths, pump/source fit.
9. **Materials / BOM** — calculated layout quantities, accepted field quantities, purchase quantities and product choices kept distinct.
10. **Review / Decision** — evidence status, unknowns, alternatives, ripples, shadows, accepted/proposed/installed state.
11. **History / Events** — event lineage, superseded states, corrections and branch/junction history.

These names and order are defaults only. They may be rearranged, hidden, split, combined or replaced without changing domain truth.

## Page rules

- Every page is declared by a manifest.
- Every visible block is a registered dock/component.
- A dock can appear on multiple pages as different planar views of the same state.
- A page may have primary, secondary, contextual, overlay and drawer zones.
- Sidebars are zones, not special hard-wired applications.
- Mobile and desktop may project the same page differently.
- A component may be removed from a page without deleting the underlying state.
- A component may be replaced by another adapter if both honour the same contract.
- Changing page composition is a layout event, not a domain event unless it changes real-world information.
- No page is allowed to become an isolated silo.

## Ripple rule

A page does not decide what must recalculate. The dependency graph does. A change made in any surface emits an event; only dependent facts/designs ripple.

## Shadow rule

Poor page/layout patterns may create a Shadow when the failure is reusable. Repeated instances attach to the existing Shadow family rather than creating duplicates.

## Primer rule

This iteration should be complete enough to test composition and information flow, but not polished as if the current page order or visual design were permanent.

## Success test

A future builder or AI can change the page order, move a tool between pages, hide a sidebar, split a page, merge two surfaces, replace a map/drawing component, or add a new dock without rewriting irrigation-domain logic or duplicating farm truth.
