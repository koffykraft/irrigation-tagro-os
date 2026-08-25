# TAGRO Irrigation UI / UX Standard v1

Status: WORKING / staging
Purpose: keep the irrigation application clear, operational and configurable without exposing internal doctrine as interface copy.

## 1. Interface language

- Use ordinary software and irrigation terms.
- Page titles name the work being done: Project Information, Field, Drawing, Design Adviser, Design Summary, Materials, Product Information, Quote.
- Descriptions are short, factual and task-specific.
- Do not place architecture, AI philosophy, design doctrine, slogans or persuasive commentary in operational page copy.
- Do not use poetic or conversational headings when a standard heading is available.
- Product information shows manufacturer-backed facts and relevant commercial information; AI opinion is not product copy.
- Development state, provenance or uncertainty is shown only when it affects the user's decision or action.

## 2. Screen content

Every visible control or field must repay its space through one or more of:
- completing the current task faster;
- improving design accuracy;
- preserving useful evidence;
- preventing an error;
- improving continuity between Field, Drawing, Design, Materials and Quote.

Hide uncommon tools until needed. Do not remove the underlying capability merely because it is hidden from the current composition.

## 3. Desktop

Desktop is the full design workspace.

- Keep the map/drawing as the dominant area.
- Show a compact persistent tool strip for frequent tools.
- Show selection actions contextually after one or more objects are selected.
- The full tool palette remains available for uncommon tools.
- Click selects one object.
- Ctrl/Cmd+click toggles an object in the selection.
- Shift+click adds to the selection.
- Selected objects may be moved, rotated, duplicated, deleted or edited as a group when the operation is valid.
- Double-clicking an editable line/polygon should expose geometry handles where supported.
- Delete removes the selected object(s); Ctrl/Cmd+D duplicates; arrow keys nudge; Escape exits the current edit/tool state.
- Object details and measurements are information, not the primary command surface.

## 4. Mobile

Mobile is a complete ordinary-use surface, not a miniature desktop.

- Primary work must be possible with one hand and large touch targets.
- The map/drawing keeps the largest available area.
- Frequent actions appear in a compact contextual dock/sheet.
- Uncommon actions remain behind More/Tools.
- Avoid permanent desktop toolbars, hover-only behavior and keyboard-dependent workflows.
- A phone must be sufficient for normal field capture, selection, basic editing, information capture, review and continuation of the same job.
- Offline/local save state must be visible when relevant.

## 5. Navigation

The normal job surfaces are:

1. Project Information — optional project/customer/site/crop/water inputs.
2. Field — location, boundaries, site objects and real-coordinate network work.
3. Drawing — clean projection of the same canonical objects.
4. Design Adviser — questions, comparisons and proposals.
5. Design Summary — measurements, hydraulic checks, assumptions and unresolved inputs.
6. Materials — material requirements, product resolution, stock and pricing when verified.
7. Quote / Sale — commercial continuation of the accepted/current design when available.

Navigation changes the view, not the underlying job.

## 6. Status and persistence

Use explicit, ordinary status language:
- Saved locally
- Saving…
- Cloud saved
- Offline
- Sync pending
- Draft design
- Design check incomplete
- Design checked

Do not expose internal phrases such as canonical truth, evidence plane, composition layer, or AI confidence unless a specialist diagnostic view explicitly requires them.

## 7. Product presentation

A standard product card may show:
- manufacturer product name;
- TAGRO name/alias when available;
- image;
- product type;
- manufacturer description;
- discharge/flow;
- pressure;
- filtration;
- spacing/range where applicable;
- manufacturer applications;
- verified stock/price source when connected;
- actions such as Compare, Use in design, View details.

Do not include AI-written recommendations or commentary as if they were manufacturer/product facts.

## 8. Configurability

Tool visibility, order, page composition and detail level may vary by job, user type, deliverable and device. Configuration must not alter object identity, geometry, measurements, engineering results, product evidence or job history.
