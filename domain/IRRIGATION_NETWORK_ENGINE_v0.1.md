# Irrigation Network Engine v0.1

## Physical chain

`Source / pump → Main → Submain → Lateral → Emitters → Plant / soil`

The network is a graph built from the same CAD objects used for drawing, identity and measurement. Geometry is not copied into a separate design truth.

## Relationships

- Lateral connects downstream to the nearest Submain, or Main when no Submain exists, within the explicit connection tolerance.
- Submain connects downstream/upstream to the nearest Main within the explicit connection tolerance.
- Geometry-derived links are **inferred relationships** and remain distinct from later confirmed/installed relationships.
- Unconnected pipes remain explicit orphans; they are never silently fabricated into the network.

## Demand propagation

Emitter demand determines lateral flow. Lateral flows aggregate into Submain flow. Submain flows aggregate into Main flow. Upstream pipe flow therefore reacts whenever emitter discharge, spacing, pressure, pipe size, elevation or network topology changes.

## Emitter pressure reaction

For a selected emitter family:

`q = q0 × (P / P0)^x`

where `q0`, `P0` and pressure exponent `x` are explicit design inputs. The engine solves pressure and discharge iteratively along the lateral; it does not assume every emitter discharges its nominal flow when pressure varies.

The lateral solution reports emitter count, total lateral demand, minimum/maximum/average emitter discharge, discharge uniformity, minimum/maximum emitter pressure and velocity.

## Pressure propagation

Pipe friction is evaluated from flow, internal diameter, length, viscosity and explicit roughness. Accepted elevation contributes static rise/fall. Head loss and elevation are propagated downstream from the source head through Main, Submain and Lateral objects.

Map elevation and surveyed elevation remain separate provenance sources. Surveyed values do not overwrite terrain values.

## Dynamic design

The design is recalculated after changes to geometry, identity, emitter configuration, elevation, source head, pipe size or network settings.

Current design targets include:

- minimum emitter pressure
- minimum emitter discharge uniformity
- maximum pipe velocity
- complete network connectivity

The optimizer searches available pipe-size steps and chooses incremental changes that most reduce hydraulic penalty for the least material-size increase. It therefore seeks the smallest connected network that satisfies the current hydraulic targets rather than merely enlarging every pipe.

Optimization is reversible and remains a proposed design state until accepted.

## Invariant

**ONE GEOMETRY → ONE IDENTITY → ONE MEASUREMENT RECORD → ONE RELATIONSHIP GRAPH → MANY DESIGN VIEWS**
