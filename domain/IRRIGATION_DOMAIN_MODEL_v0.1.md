# Irrigation Domain Model v0.1

Status: WORKING
Version: 0.1
Governing parent: TAGRO OS Domain Model v0.1 in `koffykraft/tagro-os-think`.

## 1. Domain position
Irrigation is one dock on the Farming Systems mothership. It consumes shared facts from place, crop, soil, water, weather, labour, power, machinery, finance, access and maintenance planes. It must not duplicate those facts as private irrigation truth.

## 2. Irrigation entities
- WaterSource — well, borewell, pond, tank, canal or other source.
- Pump — existing or proposed pump with power, head/flow evidence and operational constraints.
- TreatmentUnit — filter, fertigation, dosing, pressure-control or other treatment.
- Main — source-to-field or field-to-field conveyance.
- FieldConnection — transition point from main into a field/plot system.
- Submain — distribution carrier within a field/section.
- Lateral — carrier from submain toward plant/outlet pattern.
- Outlet — application point connected to a lateral.
- ApplicationDevice — dripper, bubbler, jet, mini-sprinkler, sprinkler, fogger or other device.
- PlantDemandPoint — upstream aggregate demand at a plant/basin while preserving device-level detail for lateral calculations.
- Section — operational/design area inside a plot. A section is not automatically an operating zone.
- OperatingGroup — components intended to run simultaneously.
- Valve — isolation/control object with hydraulic and human-access context.
- Route — accepted or proposed path for pipe/infrastructure.
- DesignOption — versioned candidate arrangement.
- InstalledNetwork — accepted physical reality.

## 3. Dependency chain
ApplicationDevice → Outlet/PlantDemandPoint → Lateral → Submain → Main → OperatingGroup → Pump/Power → WaterSource.

Demand propagates downstream-to-upstream. Geometry, head and constraints propagate where relevant across the same graph.

## 4. Plant irrigation logic
For plant/basin systems, multiple emitters at one plant can aggregate to one PlantDemandPoint for upstream submain demand. The individual emitter count, discharge, spacing and arrangement remain explicit for lateral hydraulic checks and wetting/application calculations.

Plant spacing contributes to outlet spacing and SDR-related design. Lateral design retains actual emitter/device properties.

## 5. Sprinkler / jet logic
Mini-sprinklers, jets and sprinklers carry at least: discharge, operating pressure, wetted diameter/radius, spacing recommendation and performance data where available.

Tree/orchard mode may calculate wetted area, litres per plant and optional equivalent depth.
Field-coverage mode may calculate spacing, overlap percentage, application rate and simultaneous demand.

## 6. Field intelligence inputs
Irrigation may reference, but should not own, facts such as:
- plot/section boundaries and rough areas;
- water-source locations;
- elevation/slope/vertical intervals;
- roads, gates, paths, buildings and obstacles;
- crop/plant identity, age, count, spacing and condition;
- soil and water-holding observations;
- weather/season/date context;
- existing pump and power availability;
- labour availability and skill;
- mechanisation routes and access;
- affordability and expansion intent;
- household vs commercial water priorities;
- photos, speech, text, sketches and map marks.

## 7. Human engineering
Filter, valve, fertigation and control placement must consider access, maintenance frequency, travel path, terrain, security and machinery movement in addition to hydraulics.

## 8. Geometry editing contract
Accepted geometry remains editable. Vertices/endpoints are visible when editing, movable, and line segments can accept inserted points. Measurement labels are an optional display layer and do not become destructive drawing state.

## 9. Flux and redesign
Any material input may change. A change must:
1. create an event;
2. identify affected dependencies;
3. preserve unaffected accepted/installed reality;
4. recalculate the smallest affected scope;
5. propagate upstream/downstream only as relationships require;
6. produce a new design version rather than silently overwriting history.

## 10. Design states
Proposed → Accepted → Installed → Superseded/Retired.

Calculated layout, accepted field layout and purchase quantity are distinct states/planes.

## 11. AI rule
AI must never infer a hydraulic or physical fact merely because a drawing visually suggests it. It must distinguish measured geometry, user description, external map/elevation data, engineering calculation and proposal.
