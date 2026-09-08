# TAGRO Irrigation — Claude Full-Site + Map Handoff

Date: 2026-09-08
Repository: `koffykraft/irrigation-tagro-os`
Working branch: `iteration-05-usable-product`

## 1. Authoritative map baseline — DO NOT REDESIGN

The last user-confirmed good map deployment is:

- Commit: `422eb6f9439f7895176bfa8bd085230315677374`
- File: `location-map.html`
- Test URL: `https://koffykraft.github.io/irrigation-tagro-os/location-map.html?v=16`

This is the visual and interaction authority for the map tool.

The current branch copy of `location-map.html` has been restored to that v16 baseline. Preserve its page shell, title bar, tool locations, map real estate, spacing and interaction hierarchy unless the owner explicitly authorises a redesign.

### v16 supporting files

- `draw-ux.js`
- `cad-foundation.js`
- `cad-selection-fix.js`
- `cad-measure.js`
- `identify.js`
- `draw-ux.css`
- `cad-foundation.css`
- `cad-measure.css`
- `identify.css`

Do not substitute a new drawing engine. Leaflet + Leaflet-Geoman Free is the accepted drawing foundation.

## 2. What v16 does well

### Map / drawing
- Esri World Imagery satellite map.
- Deep visual zoom to 23, with imagery overzoom beyond native level 18.
- Place search and geolocation.
- Geoman drawing tools: CircleMarker, Polyline, Rectangle, Polygon, Circle, Text, Edit, Drag and Removal.
- Persistent draw workflow with Enter/Esc/Finish behaviour.
- Colour and line-thickness controls.

### Identify
- Objects can be identified as Boundary, Water, Pump, Main, Submain, Lateral, Plant / Tree, Building, Road or Unidentified.
- Identity is semantic and must not change geometry.
- Identity colours are presentation, not engineering truth.
- Geometry compatibility was added to reduce accidental identification of overlapping objects.

### CAD
- CAD activator.
- Object selection and inspection.
- Edit points, Move, Done, Delete.
- Undo / Redo geometry history.
- Layers with visibility and locks.
- Groups: Field, Points, Pipes, Main, Submain, Laterals, Text and Other.

### Measure
- Point lat/lon.
- Line total length and bearing.
- Segment labels.
- Boundary area, cents, perimeter, side lengths/bearings and orientation.
- Circle radius, diameter, circumference and area.
- Small compass/orientation display.
- Map terrain elevation can be loaded separately from geometry.
- Surveyed elevation is kept separately and can be explicitly accepted.
- Map-derived elevation never silently overwrites surveyed values.

## 3. Field validation already performed

### Boundary comparison
The user hand-traced the same Punaloor plot on the satellite map.

Map drawing reported approximately:
- 4,351.0 m²
- 107.516 cents
- perimeter approximately 274.9 m

The professional survey PDF reported:
- 82.740 cents
- benchmark 100.000

The map area arithmetic itself was internally consistent; the large difference showed that hand tracing / imagery interpretation is not equivalent to a professional survey. This is a valuable calibration case, not a reason to alter the area formula to force a match.

### Driveway/elevation test
A driveway line was drawn and measured at approximately:
- 68.15 m
- E 85°
- map terrain 102 → 108 m
- rise approximately 6 m

This established that line length + elevation difference can provide a useful first terrain/slope view, but DEM values are estimates and must remain distinguishable from surveyed RLs.

## 4. Survey / CAD material supplied by owner

A professional Punaloor survey PDF was supplied for the same plot. Known PDF facts include:
- Area: 82.740 Cents
- Benchmark: 100.000
- Client: Sreejith D J
- Drawing ref: 00527 - MR - 150725
- Date: 15-07-2025
- Scale: 1 cm = 4 m
- Site at Punaloor
- A2 drawing
- Boundary, road, structures, well, trees, survey stones, benchmark, FFL and contour information.

A CAD/DWG survey drawing for the same property was also supplied for future geometry/level import and overlay validation.

Do not fabricate georeferencing. Establish whether the DWG coordinates are absolute/georeferenced or a local survey grid before overlaying it on the satellite map.

## 5. Later engineering/network work exists — treat as experimental modules, NOT UI authority

After v16, experimental files were created. They contain useful logic but their later page shells (v17/v18/v19) are NOT approved visual authorities.

Useful experimental modules in the repository include:

- `hydraulics-engine.js`
  - protected TAGRO hydraulic constants and formulas.
- `relationship-network.js`
  - experimental Main → Submain → Lateral relationship inference and downstream demand aggregation.
- `network-optimizer.js`
  - experimental optimisation attempts.
- `v16-persistence.js`
  - silent local Trial workspace persistence without adding visible controls.
- `v16-design-extension.js`
  - experimental design data appended inside the existing v16 Measure pane rather than restructuring the page.
- `engineering-ui.js`, `network-ui.js`, `assistant-ui.js`
  - later UI experiments; do not import their placement or shell automatically.
- `cloudflare/worker.js`
- `cloudflare/schema.sql`
- `cloudflare/wrangler.toml.example`
  - backend/account/AI/WhatsApp scaffolding only; deployment and credentials were not verified as production-ready.

## 6. Protected irrigation calculation constants

Do not alter without explicit engineering authorisation:

- `EXP_S = 0.6494`
- `EXP_D = 1.7079`
- `EXP_L = 2.852`
- `K_LAM = 1.3936`
- `NU = 8.93e-7`
- `HF_BASE = { lateral: 2.2, submain: 1.8, main: 1.8 }`
- `A_ROLE = { lateral: 2.7791, submain: 2.1764, main: 2.1764 }`
- IDs mm: `{12:10.0,16:13.5,20:17.2,25:22.2,32:28.4,40:36.0,50:46.7,63:59.0,75:71.0,90:86.0,110:105.1,140:133.9,160:153.0,180:171.0,200:191.4}`
- fitted K lateral `{16:236.8,20:358.2}`
- fitted K submain/main `{50:1537.9,63:2312.5}`
- `kOf(role,mm) = fitted K else A_ROLE[role] * ID^EXP_D`
- `effectiveHead = HF_BASE[role] + fallAlong(role)`
- terrain factor: `(hf/HF_BASE)^(1/2.852)`
- laminar permissible: `K_LAM * id^2 * sqrt(hf/sdr)`

These formulas are protected, but the experimental network solver around them still requires engineering validation before being represented as a complete real-world hydraulic design engine.

## 7. Relationship model to build properly

Physical chain:

`Water source → Pump → Treatment / fertigation → Main → Field connection → Submain → Lateral → Emitter/application device → Plant/soil`

Demand must propagate upstream:

1. emitter discharge + pressure behaviour + spacing/configuration determine lateral demand;
2. lateral demand, count, length, elevation and diameter affect submain demand and sizing;
3. submain operating groups determine main demand;
4. main flow + elevation + losses determine pump duty/head;
5. source/pump limitations may force zone redesign;
6. any design change should recalculate only affected dependants, not silently rewrite installed reality.

The earlier network solver attempted pressure-dependent emitter flow and upstream flow aggregation. Reuse only after independent engineering checks. Do not label an optimisation as “maximum efficiency” until the objective function is explicit (hydraulic uniformity, energy, material cost, operating time, capital cost, or a weighted combination).

## 8. What went wrong after v16

Later v17/v18/v19 experiments introduced UI regressions while trying to integrate persistence, account, AI and network engineering:

- page title / identity changed;
- new account controls crowded the mobile header;
- CAD activator became hard to see / partly off-screen;
- Ask/Assistant activator also became clipped;
- map-first hierarchy was weakened;
- network/design UI was promoted into the page shell instead of remaining subordinate to the accepted map experience;
- multiple new controls consumed essential map real estate.

The user rejected this direction and explicitly designated commit `422eb6f...` as the last good deployment.

### Rule
Never use v17/v18/v19 page layout as design inspiration. Extract logic only.

## 9. Corrections still needed on the v16 foundation

### Immediate
- Keep v16 UI unchanged.
- Improve object activation hit tolerance invisibly; visible line widths must not be increased just to make tapping easier.
- Add reliable persistence without new clutter.
- Maintain ID/CAD selection separation.
- Test restored objects after reload: identity, geometry, style, elevation, notes and future engineering properties.

### Survey / terrain
- Add slope % and 1:n grade from accepted elevation.
- Add line elevation profile.
- Add boundary corner table / side table.
- Add benchmark / surveyed RL point support.
- Import or overlay survey/DWG only after coordinate reference is established.
- Compare map geometry against professional survey without forcing agreement.

### Network / design
- Build explicit connection relationships rather than relying only on proximity inference.
- Allow inferred connection suggestions, but require confirmation for ambiguous topology.
- Support Main → Submain → Lateral → emitter/device relationships.
- Handle multiple zones/operating groups.
- Propagate emitter/device demand upstream deterministically.
- Pressure-dependent discharge must use device-specific discharge/head characteristics, not one global assumed emitter law.
- Add velocity, friction/head-loss, elevation and minimum pressure constraints.
- Add pump/source constraint loop.
- Preserve alternative design options and provenance.
- BOM must consume accepted geometry/design objects; no manual duplicate lengths.

## 10. Full new site — recommended architecture for Claude

Build the new TAGRO irrigation site around modules. Do NOT rebuild the map from scratch.

Suggested routes/modules:

- Home / Farms
- Farm / Plot
- **Map** — embed/adapt the v16 map tool as the authoritative mapping workspace
- Survey / Evidence
- Water source / Pump
- Design
- Network / Zones
- Hydraulic review
- BOM / Estimate
- Documents / Images / Survey files
- Assistant

The map should remain a replaceable/dockable capability. The full site may have a new shell outside it, but entering the map workspace should preserve the familiar v16 interaction and usable map area.

## 11. Persistence / account target

Long-term state model:

`User → Farm → Plot → Map objects → Measurements → Relationships → Design versions → Accepted design → BOM → Installation / operational events`

Trial activity should go to an isolated Trial User / Trial workspace, not contaminate production farms.

Persist:
- object IDs
- geometry
- semantic identity
- appearance
- observations/comments
- map-derived measurement references
- map elevation and provenance
- surveyed elevation and provenance
- accepted source
- pipe/device engineering properties
- confirmed relationships
- design version / maturity

Do not treat localStorage as final multi-user persistence. It is acceptable only as a safety net / trial cache.

## 12. AI / browser / WhatsApp

The repository contains Cloudflare/Claude/WhatsApp scaffolding, but treat it as architecture work, not a verified deployed assistant.

Desired behaviour:

### Browser helper
- sees the current structured farm/plot/object context;
- can explain, ask for missing facts and guide map actions;
- does not silently change map identity, surveyed facts or accepted design;
- deterministic engineering tools produce engineering numbers; AI explains and assists.

### WhatsApp assistant
- uses the same farm/account context;
- can collect descriptions, location, photos and questions;
- can prepare structured observations for confirmation;
- does not create authoritative engineering facts from prose alone.

API credentials must remain server-side secrets, never browser/GitHub literals.

## 13. TAGRO OS design tests

Every implementation should pass two tests:

### Honesty
Does it represent reality and provenance accurately? Unknown, inferred, proposed, accepted, surveyed and installed must remain distinguishable.

### Cleanliness
Can the next person understand and continue the work without hidden assumptions or clutter?

Do not add a feature merely because it can be added. If it obscures the map, duplicates truth, hides provenance, or creates fake certainty, redesign it.

## 14. Claude execution instruction

1. Read this handoff completely.
2. Inspect `location-map.html` at commit `422eb6f9439f7895176bfa8bd085230315677374` and its supporting v16 files completely before editing.
3. Treat that page structure as protected.
4. Inspect later engineering/network/backend modules for reusable logic only.
5. Build the full site as a new modular application around the protected map tool.
6. Do not claim a feature is complete until its actual browser behaviour is tested.
7. Do not silently guess missing survey coordinates, hydraulic data, device curves, source flow, pump curve, crop demand or operating strategy.
8. Preserve provenance and alternative design versions.
9. Keep farmer-facing experience simple; keep engineering depth available without consuming map workspace.
10. Before replacing any accepted interaction, show the proposed change and obtain explicit approval.

## 15. Current map location summary

Authoritative map source:

`koffykraft/irrigation-tagro-os`

Branch:

`iteration-05-usable-product`

File:

`location-map.html`

Authoritative commit:

`422eb6f9439f7895176bfa8bd085230315677374`

Known-good URL:

`https://koffykraft.github.io/irrigation-tagro-os/location-map.html?v=16`

Use this as the starting map tool for the new full build.
