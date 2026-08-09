# Dockable Page System v0.1

Status: WORKING

## Purpose
The application shell must not hard-wire page order, visibility, size, nesting, or placement. Pages are compositions of docks over shared domain state.

## Rules
1. Page order is data, not code.
2. A page is a view over shared domain state, not an isolated silo.
3. Every visible component is a dock registered in a component library.
4. Docks can be added, removed, reordered, resized, and collapsed without changing domain logic.
5. Sidebars can be shown, hidden, resized, or replaced.
6. Visual tokens are centralized and replaceable.
7. Mobile and desktop are layout projections over the same state.
8. Components communicate through shared events and state rather than hidden direct coupling.
9. A user action is an event. Events may create ripples through declared dependencies.
10. Known failure families should be checked against Shadow memory before new implementation patterns are accepted.

## Current implementation
- `app/config/layout.default.js` defines page order and default dock composition.
- `app/library/components.js` is the reusable component library.
- `app/core/store.js` provides the event, state, and ripple plane.
- `app/core/app.js` renders pages from configuration and supports rearrangement.
- `app/styles/tokens.css` is the visual token layer.
- `app/styles/docks.css` is the generic dock and layout layer.

## Replaceability boundary
Future map, tile, storage, drawing, calculation, weather, elevation, and interpretation services attach through adapters. They do not own farm truth.
