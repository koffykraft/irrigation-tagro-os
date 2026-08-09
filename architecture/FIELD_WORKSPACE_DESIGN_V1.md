# TAGRO Irrigation — Field Workspace Design v1

Status: WORKING PRODUCT DESIGN
Junction: `iteration-06-field-workspace`
Replaces: the Iteration 05 Field/Map interaction surface. The old Field/Map UI is not a visual or interaction reference.

## Purpose

The Field workspace is a core design environment, not a form with a map embedded inside it. It must let a farmer/designer orient, observe, draw, correct, connect and inspect the physical irrigation system directly on the field.

## Research basis

The replacement was derived from authoritative experience patterns rather than the discarded TAGRO/Jain map UI:

- SketchUp for Web: common actions are stable tools (Select, Eraser, Pencil, Move, Measure, Pan) surrounding the canvas; object creation and object manipulation are distinct.
- Autodesk Fusion drawing/sketch environments: Create, Modify, Inspect and Finish are separate states; existing geometry is selected then edited/moved/deleted; finishing explicitly exits the editing context; undo/redo are first-class history.
- Mapbox/Google/Apple mobile-map interaction documentation: pan and pinch remain native map gestures; application controls can be selectively added/removed or map gestures enabled/disabled according to mode; controls need edge padding/placement so they do not collide with the map.
- Mapbox Draw: drawing is a mode with explicit create/edit/delete state, not a permanent row of unrelated object buttons.
- Autodesk Civil 3D pipe networks: a physical network is a collection of pipe and structure objects connected at connection points; layout creates connected parts; networks are then edited, interference-checked and hydraulically analysed.
- IRRICAD: irrigation design joins CAD drawing to hydraulic pipe sizing/network analysis; connectivity checks, automatic connection to nearby pipes, design alternatives, BOM and hydraulic reporting are network consequences, not merely drawing decoration.
- EPA EPANET: pressurised networks are represented as connected pipes and nodes/junctions, pumps, valves, tanks/reservoirs; the visual editor is a front end to a hydraulic network model.

## Experience hierarchy

`MAP CONTEXT → OBJECT TYPE → TOOL / ACTION → GEOMETRY → CONNECTIVITY → NETWORK INTERPRETATION → ENGINEERING`

The map is context. Geometry is evidence. Pipes are network edges. Water sources and junctions are nodes. Hydraulic meaning is derived from connected network state, not from line colour.

## Mobile workspace rules

1. The map/canvas dominates the screen.
2. Satellite imagery is the default field-identification context. A conventional map remains an alternate basemap.
3. Native mobile pan/pinch gestures remain available while inspecting and while drawing.
4. The primary tool rail contains actions/families: Select, Boundary, Source, Pipe, Measure, Locate.
5. Pipe role is chosen after selecting Pipe: Main / Submain / Lateral. Domain object type and editing action are not mixed into one toolbar.
6. Every creation mode exposes explicit `Finish` and `Cancel`.
7. `Undo` and `Redo` are persistent workspace commands; while drawing they operate on the current vertex history, otherwise on saved geometry mutations.
8. Selection is always recoverable. Selecting an existing object opens contextual actions: Edit / Move / Delete.
9. Vertex editing is direct manipulation with draggable handles.
10. Whole-object movement is a separate explicit action.
11. The global OS navigation does not cover the drawing workspace. Entering Field opens a focused workspace; Done leaves it.
12. The system refuses obvious invalid geometry rather than quietly saving it.

## Geometry integrity

### Boundary
- three or more vertices;
- explicit Finish closes the polygon;
- self-intersecting polygons are rejected;
- edits remain available after save;
- area and perimeter are derived values.

### Pipe
- two or more vertices;
- type = main / submain / lateral;
- nearby source/pipe endpoints and pipe segments become snap candidates;
- snapping creates intentional network connectivity;
- overlapping duplicate pipe geometry is rejected rather than silently stacked;
- edits and movement remain possible after save;
- length is derived from geometry.

### Source
- point object;
- can serve as a network root for connectivity interpretation.

## Network reading

A visible line is not sufficient to define a pipe network. The engine interprets connections.

- Pipe endpoints are nodes.
- A pipe endpoint snapped onto another pipe creates a junction node, including a connection to the interior of an existing pipe.
- A source is a root node.
- Connected pipes can be traversed from the source.
- A pipe can therefore report whether zero, one or both ends are connected and whether it currently reaches a source through the network.
- Future hydraulic segmentation may split a displayed polyline into analytical edge segments at junctions without forcing the farmer to redraw the visible pipe.

This preserves Planar separation: one accepted physical pipe geometry can support drawing, topology, hydraulics and BOM views without duplicating truth.

## Drawing-state model

`SELECT ↔ CREATE ↔ FINISH/CANCEL ↔ SELECT ↔ EDIT/MOVE/DELETE`

Creation states are temporary. There is always an explicit way out.

## Current implementation boundary

Implemented in this junction:
- dedicated full-screen Field workspace;
- MapLibre map renderer;
- satellite default / map alternate;
- select/boundary/source/pipe/measure/locate tools;
- Main/Submain/Lateral role palette;
- explicit Finish and Cancel;
- draft vertex Undo/Redo;
- saved geometry Undo/Redo;
- boundary self-intersection rejection;
- pipe overlap rejection;
- snap-to-source / pipe endpoint / pipe segment;
- editable vertices;
- whole-object move;
- deletion;
- area, perimeter and length inspection;
- network end-connectivity and source-reachability inspection;
- persistence through the product IndexedDB stores;
- geometry events and provenance-compatible field evidence.

Not represented as complete yet:
- survey-grade positional accuracy;
- elevation/DEM provider;
- automatic lateral filling;
- valves/fittings/filter/fertigation/pump graphical objects;
- analytical pipe splitting at junctions;
- full hydraulic PASS/FAIL;
- route optimisation;
- BOM generation from network topology;
- CAD/PDF design-sheet export.

These future capabilities must dock into the network/geometry contracts rather than alter the core mobile interaction model merely for implementation convenience.
