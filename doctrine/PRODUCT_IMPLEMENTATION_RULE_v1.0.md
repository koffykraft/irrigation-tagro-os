# TAGRO Irrigation OS — Product Implementation Rule v1.0

Status: ACCEPTED FOR IMPLEMENTATION
Date: 2026-08-09
Project junction: `iteration-05-usable-product`

## Rule

From this junction onward, implementation artifacts intended as pages or applications must be usable product surfaces, not mockups, trial pages, image-based stand-ins, or samples presented as product.

A product surface must connect to real state and working behaviour appropriate to its declared maturity. Where a capability is present on the surface, its components must function. Where a capability is not yet implemented, it must be absent or explicitly unavailable; it must not be represented by decorative controls.

## Required characteristics

1. Real user actions produce real state changes.
2. State is persisted in an actual storage layer. The first product implementation uses IndexedDB through a replaceable persistence contract and supports export/import for portability.
3. Real map and drawing tools use geographic coordinates and create editable domain objects.
4. Captured farmer information is stored as facts/evidence with provenance rather than decorative form values.
5. Task selection drives relevant questions and surfaces using the accepted adaptive need/query engine.
6. Review/history surfaces read the same persisted state and events created elsewhere.
7. Calculation surfaces calculate from captured/accepted values and declare maturity/unknowns.
8. Network objects are editable data, not painted lines or screenshots.
9. No page may use a generated image as a substitute for a working control, map, diagram, or application state.
10. No sample/mock/trial page may be represented as the product.

## Maturity honesty

A usable product may still be incomplete. Shortcomings are handled by iteration, but working functions must remain real and stateful. Missing capability is preferable to false capability.

## Replaceability

The browser database, map provider, drawing library, calculation implementation, synchronization layer, product catalogue and hosting may later be replaced behind their contracts without changing farm truth or accepted engine logic.
