# TAGRO Irrigation Environment — Deterministic Engineering Dock

Status: WORKING  
Engine: `irrigation-engine-1.0.0`

## Purpose

This dock owns reproducible numerical irrigation checks that must not be invented by the conversational adviser.

It presently provides:

- permissible run assessment;
- terrain-adjusted turbulent assessment;
- laminar/VLP permissible run assessment where required inputs exist;
- Reynolds number and flow-regime interpretation;
- comparison of nominated pipe sizes;
- operating-section calculation from known demand and available flow;
- irrigation runtime from known required volume and application flow;
- 13 issued-estimate conformance checks inherited as golden regression evidence.

## Evidence boundary

The 13 conformance checks reproduce values from two issued historical design jobs and are regression anchors. They are not a constitutional rule that only the pipe sizes in those jobs may be used.

Fitted constants are marked `verified_fitted`.

Values derived from internal diameter are marked `derived_internal_diameter` and must not be represented as manufacturer-chart verification.

Unsupported or missing inputs return `unknown` / `escalate`; the engine does not silently substitute another size, pressure, flow, slope or operating assumption.

## AI boundary

Anthropic/other advisers may:

- ask for missing consequential inputs;
- explain deterministic results in ordinary language;
- compare practical consequences;
- propose which deterministic check should be run.

They may not generate their own hydraulic PASS/FAIL, permissible length, section count or runtime when the deterministic dock has not supplied one.

## Current API projection

The staging Worker exposes:

- `GET /api/engineering/conformance`
- `POST /api/engineering/assess-run`
- `POST /api/engineering/compare-sizes`
- `POST /api/engineering/sections`
- `POST /api/engineering/runtime`

These routes are deterministic and do not require the AI model.

## Not yet complete

This first dock does not yet claim:

- complete pump-system sizing;
- complete filter sizing;
- complete main/submain topology optimization;
- exact BOM quantities;
- verified friction data for every material and pressure class;
- verified manufacturer curves for every application device;
- spatial length/elevation from the new FIELD canvas before the map/measurement adapter is bound.

Those remain explicit dependencies rather than guessed values.
