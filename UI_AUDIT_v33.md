# TAGRO Irrigation UI Audit — v33

Date: 2026-08-23
Baseline: Location Map v16 functional shell, current working branch `iteration-05-usable-product`

## Audit scope
All visible windows, panels, sheets, dialogs, popups, floating controls, tables and transient overlays currently loaded by `location-map.html`.

## Findings before correction

| Surface | Desktop | Phone portrait | Phone landscape | Blocking defects found |
|---|---|---|---|---|
| Top bar / Draw / ID / FAM / Search | usable but dated | cramped | crowded | inconsistent targets, title/search competition |
| CAD dock | usable | poor | partial | desktop dock shrunk into phone; limited working area |
| CAD Layers / Reset | usable | usable but dense | usable | destructive action used browser-native confirm |
| CAD Measure / Design extensions | scrollable | long/dense | cramped | inconsistent component styling and target sizes |
| BOM | usable | FAIL | poor | oversized desktop-style panel/table; close can become unreachable; horizontal density |
| Family tree | usable | marginal | marginal | separate sizing model; no unified phone-sheet behaviour |
| Identify | usable | marginal | marginal | separate bottom panel rules; header actions crowded |
| Distance ruler chip | usable | marginal | usable | action row can crowd narrow width |
| Drawing colour/weight palette | usable | marginal | usable | can compete with bottom sheets/safe area |
| Reset confirmation | browser dependent | FAIL experience | FAIL experience | browser modal is visually huge and outside app design control |
| Hover target label | usable | not primary | not primary | hover cannot be relied on for touch; existing tap selection remains required |

## Root cause
The functional modules were added incrementally and each brought its own width, height, breakpoint and visual language. There was no single responsive shell governing major surfaces. This produced inconsistent mobile behaviour and allowed desktop-oriented panels/tables to survive into phone portrait.

## v33 correction
1. Add one additive responsive style layer (`v16-modern-ui.css`) loaded after existing module styles.
2. Add viewport/runtime audit layer (`v16-modern-ui.js`) using `visualViewport` where available.
3. Convert CAD, BOM, Family and Identify to consistent mobile bottom sheets with sticky accessible headers and safe-area padding.
4. Keep desktop as side/floating work surfaces, but modernize radius, typography, spacing, cards and controls.
5. Convert BOM table rows to mobile cards at narrow widths; retain table presentation on desktop.
6. Collapse phone title to `TAGRO` and make Search icon-first with focus expansion.
7. Enlarge touch targets and normalize focus states.
8. Replace browser-native Reset confirm with an in-app responsive destructive-action sheet.
9. Preserve all existing functional modules, IDs, calculations, persistence, family/network logic and drawing tools.

## Acceptance gate
A major surface is not accepted unless:
- title/header and close action are visible and reachable;
- no horizontal viewport overflow;
- internal content can scroll without moving the page shell;
- phone portrait, phone landscape and desktop each have an intentional layout;
- destructive actions require confirmation but do not trap the user;
- essential interactions do not depend on hover;
- touch controls are approximately 40–44 px where practical;
- orientation/visual viewport resize triggers map invalidation;
- BOM quantities/calculations are unchanged by visual redesign;
- runtime confidence is not rated HIGH until screenshots/browser tests pass.

## Runtime audit scoring
`TAGRO_MODERN_UI.audit()` checks open major surfaces for viewport overflow and unreachable close controls and records a current score. This is supplemental to manual desktop/phone/orientation inspection.
