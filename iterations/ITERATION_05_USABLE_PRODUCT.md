# TAGRO Irrigation OS — Iteration 05: Usable Product

Status: WORKING PRODUCT
Starting junction: `iteration-04-reflective-capture`
Date: 2026-08-09

## Objective

Move from architecture and capture design into real deployable pages. No mock pages, sample pages or image substitutes are permitted as product surfaces.

## Implemented product surfaces

- Purpose / task selection
- Farm intelligence / reflective crop meaning
- Real geographic Field surface
- Water / pump / operating reality
- Application device and plant-demand calculation
- Network inspection and permissible lateral reference check
- Review / evidence / event history

## Working components

- IndexedDB persistence through a replaceable adapter
- Export/import of full project state as JSON
- Task-specific sub-minimum completion logic
- Reflective capture and multi-purpose crop meaning
- OpenStreetMap geographic base through Leaflet
- Editable geographic polygon/line/marker creation through Leaflet-Geoman Free
- Domain objects for boundary, water source, main, submain and lateral
- Automatic evidence creation when map geometry is captured
- Protected TAGRO lateral reference calculation
- Event history
- Installable/offline-capable PWA shell for application code and previously fetched resources

## Product honesty

Capabilities not implemented are not represented as completed controls. This iteration does not yet claim cloud multi-user synchronization, final hydraulic PASS/FAIL for a complete network, final BOM/pricing, AI speech/photo interpretation, automatic pipe routing, survey-grade geometry or installed-design acceptance workflow.

Those are future product capabilities and must be implemented as functioning components before appearing as such in the application.

## Entrypoint

`product/run.html`

## Persistence

The current real database is browser IndexedDB. It is local to the device/browser profile. Export/import provides deliberate portability. A later cloud database/sync layer must dock behind the same project/fact/feature/event contracts rather than replacing farm truth.

## Visual rule

The product uses a new visual language created for this branch. Earlier TAGRO/Jain irrigation interfaces were not used as design references.
