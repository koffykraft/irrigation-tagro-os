# TAGRO Irrigation OS — Iteration 01

Status: WORKING / PRIMER

## Project blind

This iteration tests only the first usable information flow of the irrigation OS. It does not authorize expansion into a finished irrigation engineering product.

### In scope

- Mothership-first capture.
- Shared field intelligence state with provenance.
- Device location capture when permitted.
- Editable rough field boundary sketch with movable points.
- Crop, water, pump, power, labour and access observations.
- Provisional irrigation application and physical-network inputs.
- Simple downstream-to-upstream dependency ripples.
- Dockable page/component arrangement.
- Persistent local working state.
- Review of current evidence, events and ripples.

### Deliberately not finished

- Production map provider.
- Elevation service.
- Photo/voice AI interpretation.
- Database/cloud persistence.
- Survey-grade geometry.
- Full hydraulic engine.
- Product catalogue/BOM/pricing.
- Automated pipe routing.
- Final UI hierarchy, colors, page order or component sizes.

These are future junctions and must not be inferred as approved merely because they are discussed.

## Primer rule

Everything in this iteration is a pencil line unless separately accepted. Build enough to expose information relationships and user experience. Do not over-engineer replaceable surfaces.

## Success test

A user should be able to open the app, tell TAGRO basic farm information, record a place/crop/water/pump constraint, sketch a rough field with editable vertices, enter a provisional irrigation choice, and see that changes remain shared rather than trapped in isolated pages.

## Branch rule

`iteration-01` remains a recoverable project junction. Later experiments should branch from a named junction rather than silently changing this iteration's objective.
