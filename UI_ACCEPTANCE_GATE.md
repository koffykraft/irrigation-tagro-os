# TAGRO Irrigation OS — UI Acceptance Gate

Every new visible element must pass this gate before it is described as ready.

## Triple check

1. **Geometry / position** — desktop and mobile viewport fit, no unintended overlap, no covered map/tool areas, no clipped controls, no hidden close/back action, no off-screen dropdown/menu.
2. **Interaction / lock-up** — visible controls receive pointer/touch input, modal/dock stacking cannot trap the user, background panels are suspended when covered, close/undo/navigation remain reachable, touch targets remain usable.
3. **Rendering / content** — text wraps without collision, tables/charts/formula boxes fit their containers, labels and units remain legible, dropdown values are not clipped, tables paginate or scroll deliberately, no silent overflow.

## Confidence score

Each check is scored 0–100. Overall confidence is the mean.

- **95–100 HIGH** — acceptable after browser/runtime verification.
- **85–94 GOOD** — usable but inspect noted findings.
- **70–84 REVIEW** — do not call production-ready.
- **Below 70 FAIL** — repair before field use.

Static code inspection alone cannot receive HIGH runtime confidence. Browser-served verification at representative desktop and mobile sizes is required.

## BOM / Design page specifics

- BOM tables must use viewport-aware pagination when row count exceeds the visible table budget.
- Pagination controls must remain visible and large enough to use on mobile.
- Charts must fit the panel width and retain readable labels/legends at the actual viewport.
- Formula/result cards must never cover an input needed to change the result.
- Dropdowns, numeric inputs and units must render as one understandable control group.
- Opening BOM must not leave the CAD dock active underneath it.
- No new permanent page chrome is permitted merely to expose diagnostics; QA is available through `window.TAGRO_UI_QA` and the console.

## Required release sequence

READ → VERIFY → CHANGE SMALLEST POSSIBLE SCOPE → STATIC CHECK → SERVED DESKTOP CHECK → SERVED MOBILE CHECK → INTERACTION CHECK → CONFIDENCE SCORE → COMMIT/FETCH-BACK VERIFY.
