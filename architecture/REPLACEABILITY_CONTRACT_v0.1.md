# Replaceability Contract v0.1

Every technical component is replaceable by default.

## Replaceable surfaces

The following must be isolated behind contracts/adapters:

- map engine
- map tile/provider source
- geocoding/elevation/weather providers
- drawing/editing engine
- icon system
- color/theme system
- sizing and spacing tokens
- navigation shell
- sidebars, sheets, drawers and toolbars
- page composition
- forms and capture widgets
- database engine
- object storage
- sync layer
- authentication
- AI provider/model
- hydraulic engine implementation
- reporting/export engine

## Rule

Domain objects may depend on interfaces, never on a specific vendor implementation.

Example:

`FieldMap` may request `MapProvider`, `ElevationProvider` and `GeometryEditor` capabilities. It must not require Leaflet, Mapbox, Google Maps, ArcGIS or any other particular implementation.

## UI rule

Meaning is separate from presentation. `WaterSource`, `Boundary`, `Section`, `Main`, `Submain`, `Lateral`, `Outlet`, `Path`, `Gate` and `House` are domain concepts. Their color, icon, shape, control placement and screen arrangement are presentation concerns and may change independently.

## Database rule

Persistence contracts describe objects, events, relationships, versions and provenance. Database-specific tables are implementation detail.

## Replacement test

A component is not adequately isolated if replacing it requires changing unrelated domain logic.

Every major adapter should eventually have a conformance test proving that a replacement can satisfy the same contract.
