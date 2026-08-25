# TAGRO Irrigation OS — Project Handoff

**Date:** 2026-08-25  
**Repository:** `koffykraft/irrigation-tagro-os`  
**Working branch:** `iteration-06-plain-production`  
**Purpose of this handoff:** continue the current repair/build without losing the decisions, evidence boundaries, or unfinished work when the ChatGPT conversation rolls over.

---

## 1. START HERE — CURRENT INTENT

The current assignment is **not another visual redesign exercise**. The owner asked for a **simple, plain, usable page set in which the functions work reliably**. Styling is secondary. The build should be easy to understand, free of page errors, and suitable for actual irrigation design work before further polish.

The permanent user-facing work surfaces are:

1. **Information** — project/customer/crop/water/site inputs.
2. **Field** — real map, measurements and canonical field objects.
3. **Drawing** — the same canonical objects in a clean drawing surface; never a second independent truth.
4. **Adviser** — conversational assistance; proposals only, never silent design mutation.
5. **Design** — deterministic design/engineering state, knowns/unknowns and checks.
6. **Materials** — material requirements/BOM derived from accepted design evidence.

A common shell/navigation identity is required across pages. Page-specific tools may sit in a compact Windows/BUSY-like command/ribbon area so the working surface is not wasted.

**Do not make Adviser the landing page.** Information/Field should remain natural job-entry routes.

---

## 2. NON-NEGOTIABLE OWNER INSTRUCTIONS

These are operating constraints for all continuation work:

- Read every supplied/relevant file completely before changing it. Do not claim inspection or verification that did not occur.
- Preserve working functions, IDs, calculations, workflows and file relationships unless a change is explicitly authorised.
- Verify behaviour against the existing working implementation before delivery. If something cannot be checked, state that clearly instead of guessing.
- Do repairs in **batches/phases**, not one cosmetic correction at a time.
- Prefer **plain, obvious, standard wording**. No artistic AI page titles, filler commentary, philosophical slogans or uncalled-for explanation on operational pages.
- Product cards should show pertinent manufacturer/product information only. Product images must be normal catalogue size; text must remain readable. Do not add AI commentary under product images.
- Mobile must be considered, but desktop/P.C. usability is also essential.
- No login/account system at this stage. Anonymous/local job state is acceptable.
- AI is not engineering authority. Deterministic engine/manufacturer evidence outrank AI suggestions.
- AI geometry is preview/proposal until accepted by the human.
- Unknown remains unknown. Do not invent hydraulic PASS/FAIL, product choice, pipe size, elevation, BOM quantity or cost from missing inputs.
- Production must not be claimed merely because code is committed. Browser/runtime acceptance is a separate gate.

---

## 3. DESIGN DOCTRINE TO PRESERVE

The relevant invariant doctrine from the TAGRO OS work is:

- Preserve what is known.
- Keep what may change revisable.
- Propagate consequences, not assumptions.
- Never confuse the current answer with permanent truth.
- Physical reality outranks recalculation.
- Capture before prescription.
- Ask only consequential questions.
- Provenance/status matter: observed/described/measured/inferred/confirmed/proposed/accepted/installed must not be silently collapsed.
- The farm/field is the mothership; irrigation is one docked system.
- Same object should persist across Field, Drawing, Design and Materials rather than being recopied into separate truths.
- If an impasse exists, preserve input, state what was not done, and ask the smallest settling question.

---

## 4. CURRENT TECHNICAL BASE

### Canonical spatial model

`app/environment-v1/spatial-store.js`

- Contract: `tagro-spatial-state-v1`.
- GeoJSON `[lng, lat]` is authoritative geometry.
- Stable IDs by object kind (Boundary, Main, Submain, Lateral, Plant, Water, Pump, Path, Device etc.).
- Field and Drawing operate on the same local state.
- Events/revision history are maintained.
- Parent network connection is represented in object properties and is being normalised into explicit relationship records as part of the current repair batch.

### Main current workbench

`app/environment-v1/workbench.html`  
`app/environment-v1/workbench-v2.js`  
`app/environment-v1/workbench.css`  
`app/environment-v1/workbench-v2.css`  
`app/environment-v1/workbench-desktop-ux.css`

Current implemented capabilities include:

- Satellite/Street map.
- Place / lat,lng search.
- GPS locate.
- Field/Drawing switch.
- Boundary, Plot, Section, Crop area, Path, High/Low point.
- Water source, Pump, Tank, Main, Submain, Lateral, Plant, Device.
- Single and multi-selection.
- Ctrl/Shift/meta additive selection support.
- Same-type selection.
- Move, drag, nudge, rotate, duplicate, delete.
- Vertex/point editing.
- Labels/details.
- Explicit parent connection.
- Emitter/sprinkler attributes on laterals.
- Ruler/spacing measurement.
- Lateral layout from a selected submain with preview, spacing, direction, clipping and create.
- Accepted AI geometry preview support.

The Drawing view is an SVG projection of the same canonical GeoJSON, not a bitmap copy.

### Information

`app/environment-v1/info.html`  
`app/environment-v1/info.js`  
`app/environment-v1/job-info.js`

Current form categories include customer/site, purpose, water/power, plots/crops, site conditions and product information. Several wording/overload issues have already been identified (see Section 9 below).

### Adviser / deterministic engineering

The Worker and browser adapter architecture already separates:

- deterministic engineering truth/checks;
- manufacturer/product evidence;
- AI reasoning/proposals;
- human acceptance.

Historical runtime evidence confirmed the deterministic conformance suite at **13/13** in the prior staging build. Do not claim newer branch runtime acceptance without re-running it.

### Anonymous learning

`app/environment-v1/environment-learning.js`

Learning is job-local and evidence-like. It must not become an uncontrolled global engineering rule.

### Optional cloud persistence

The Worker has an anonymous D1 job adapter and the browser shell has cloud-envelope saving logic. No login/users are required. Whether the current Cloudflare staging deployment has the required D1 binding must be verified from `/health`; do not assume it.

---

## 5. REPAIR COMMITS MADE IMMEDIATELY BEFORE THIS HANDOFF

These are the code-side repairs committed during the final session before conversation rollover:

1. `00da49adce10b86935c772d437cbcb7e926ae286`  
   **Canonical spatial relationship/storage repair.** The spatial store was revised so network parent assignments and relationship state are normalised together, and browser persistence failure can be surfaced rather than silently treated as success.

2. `f571b2f9888c73670da3755aaf7ea02282c890ec`  
   **Spatial proposal relationship repair.** Accepted generated geometry now carries/creates its upstream relationship consistently with the canonical network model instead of producing orphaned design lines.

3. `abe68707d38b3157796dcbb0a242356496206cac`  
   **Complete job-envelope/cloud-save repair.** The cloud envelope/save state was revised so the saved job is not judged only by spatial revision; Information + spatial state + composition + learning are treated as one job state for persistence/sync status.

4. `1dace8317fe15444ce61e3347c574b55b18d8dbd`  
   **Information-store hardening.** Information writes were protected so browser storage failure is visible instead of allowing a false “saved” state.

5. `b17d8fe8e00880eaaa776eb7969de52f68984dcf`  
   **Learning-store hardening.** Job-local learning/proposal-decision storage was protected so an accepted/rejected proposal does not crash because browser storage is unavailable.

These commits are **coded repairs, not a declaration that browser acceptance has passed**.

---

## 6. WHAT IS KNOWN TO HAVE WORKED BEFORE THIS REPAIR BRANCH

Runtime/browser evidence from earlier staging work confirmed the following spine together in the then-current build:

- Cloudflare Worker configuration.
- Anthropic Claude Sonnet 4.6 through AI Gateway BYOK.
- JSON response parsing.
- TAGRO conversational adviser.
- Deterministic engineering conformance 13/13.
- Product knowledge retrieval.
- Anonymous job-local learning smoke behaviour.

Later spatial/UI work was coded after that confirmation and must be browser-tested separately.

---

## 7. CURRENT HONEST STATUS

### Coded / available

- Canonical GeoJSON spatial store.
- Shared Field/Drawing identity.
- Workbench map/drawing tools listed above.
- Real coordinate measurements.
- Group selection/move/rotate/delete/duplicate.
- Explicit network parent selection.
- Lateral family layout from submain.
- AI preview/acceptance separation.
- Information capture.
- Product deck/media support.
- Adviser and deterministic engineering integration.
- Job-local learning.
- Optional anonymous cloud persistence architecture.
- Common shell work has begun.

### Not yet accepted / still requires work

- Full browser acceptance of the **current repaired branch** on desktop.
- Mobile acceptance.
- One end-to-end test covering Information → Field → Drawing → Adviser → Design → Materials → save/reload.
- Authoritative Design and Materials rendering cleanup (avoid competing legacy/new renderers).
- Page-set launcher/test page requested by owner.
- Final common navigation/ribbon consolidation across all six pages.
- Information page progressive disclosure and wording cleanup.
- Product deck sizing/text-density final pass.
- Cloud persistence runtime test with actual current D1 binding, if enabled.
- Elevation remains non-authoritative unless a real source is connected.
- Full Jain catalogue/images are not fully normalised.
- Installed/service outcome learning is not complete.
- No production cutover is authorised merely by this handoff.

---

## 8. REQUIRED TRIPLE-PASS BEFORE OWNER TESTING

The owner explicitly asked for a triple pass over **every page** so he does not have to discover page errors himself.

### PASS 1 — FUNCTION / DATA / INTEGRATION

For every permanent page/surface:

- JavaScript parse/startup errors.
- Required DOM IDs exist for every handler.
- Buttons/links have valid endpoints.
- No empty/retired script shadows an active script.
- One canonical job ID is used.
- Information persists and reloads.
- Spatial objects persist and reload.
- Explicit relationships persist and reload.
- Learning evidence persists without changing engineering authority.
- Adviser receives current job context.
- AI preview does not mutate accepted geometry.
- Accept does mutate canonical geometry once, with provenance.
- Delete/duplicate/move/rotate/edit are reflected in both Field and Drawing.
- Design/Materials read the same current canonical state.
- Deterministic engineering service still reports 13/13 before any hydraulic acceptance.
- Browser storage failure produces a visible warning.
- Cloud saving, when available, saves the complete job envelope and handles conflict/offline states honestly.

### PASS 2 — UI / UX / NAVIGATION

- One shared page identity/navigation.
- No duplicate headers covering content.
- No flicker caused by two shells/renderers fighting for layout.
- No Adviser landing-page accident.
- Contextual page tools are visible without repeated `+` hunting.
- Map retains maximum useful working area.
- Inspector/panels do not cover essential map controls.
- Multi-select and same-type controls do not overlap.
- Bottom/right labels/buttons have consistent text size and control size.
- Desktop keyboard modifiers are intuitive; touch has an explicit alternative.
- Selected object can be reshaped by handles/points.
- Mobile panels do not overflow or hide primary work.
- Standard language, not AI-style prose.
- Advanced settings are available but not dumped on the first screen.

### PASS 3 — ASSETS / RENDERING / RELEASE

- Satellite and Street tiles load.
- Product images resolve, are not oversized, and preserve aspect ratio.
- Product descriptions/specifications remain legible.
- No broken images/scripts/styles.
- Current Worker assets actually contain the branch files intended for test.
- Cache/versioning does not leave old JS against new HTML.
- Test desktop Chrome plus a mobile viewport/phone.
- Refresh/reopen preserves job state.
- Direct URLs for all pages return expected assets.
- Only after the above, give the owner the page-set launcher and ask him to do the field/user acceptance tests.

---

## 9. INFORMATION PAGE CORRECTIONS ALREADY REQUESTED BY OWNER

Do these as one UX batch rather than individual patches:

- Plot dimensions should offer **Map measurement** as an immediate alternative/link.
- If length/width are known, calculate/fill area where valid; area entry should explain it is mainly for when sides/shape are not known. Do not pretend rectangular area for an irregular mapped plot.
- Replace unclear **“Application thought”** with normal language such as **“Irrigation method planned”** / **“Emitter or sprinkler planned”** depending context.
- Do not call every outlet a “device”. Use **Emitter / sprinkler / jet / bubbler / mister / fogger** or a suitable umbrella term such as **Irrigation outlet** where required.
- Replace **“Known device / model”** with **“Emitter / sprinkler model”** (or “Irrigation outlet / model”).
- Replace **“Known discharge LPH”** with **“Emitter / sprinkler discharge (LPH), if available”** or similarly natural wording.
- Use **“Water source to field distance”** rather than the more cryptic “source-to-field”.
- Reduce the long “Design and purchase options” four-box reading burden. Show what is immediately relevant first, while keeping advanced comparison/quotation functions discoverable.
- Keep product cards industry-standard: smaller consistent image box, normal product title, concise use/specification rows, readable text, no AI opinion.

---

## 10. FIELD / DRAWING INTERACTION REQUIREMENTS

The owner has explicitly requested:

- Group select and multi-select.
- Ctrl+click / Shift+click style additive selection on PC where sensible.
- Equivalent explicit touch/mobile mode.
- Move/delete/edit/duplicate selected groups.
- Object shape/size adjustment by dragging corners/points/handles.
- Main/Submain/Lateral connection editing.
- Duplicate laterals.
- Layout laterals at specified spacing.
- Left/right/both-direction generation where applicable.
- Zoom closely while drawing.
- Thin, readable linework.
- No unwanted pre-populated laterals on a blank/raw job.
- No “second selection fails” regression.
- Labels must not obscure the design.
- Map and Drawing must remain the same objects with same IDs.

The current workbench implements much of this; it still needs the triple-pass and actual browser acceptance.

---

## 11. DESIGN / MATERIALS RULES

Do not reduce these pages to generic cards.

### Design must show

- Current canonical network counts and lengths.
- Connections/relationships.
- Engineering state and unresolved inputs.
- Hydraulic results only when deterministic inputs exist.
- Unknown/attention states without inventing an answer.
- Accepted vs proposed design distinction.

### Materials must follow accepted design evidence

Preferred conceptual BOM sequence remains:

Emitter/application outlet → accessories → Lateral → accessories → Submain → accessories → Main → accessories → Venturi/fertigation → accessories → Filter → accessories → Pump → accessories → Labour (optional) → Transportation (optional) → GST → Notes.

Multiple plots should support individual and combined summaries. Product/price editions must supersede rather than silently overwrite historical evidence.

---

## 12. PRODUCT KNOWLEDGE / IMAGES

Known normalized Jain evidence already ingested includes examples such as:

- J-SC PC Plus.
- J-Loc.
- Turbo PC.
- Jain Jet.
- Modular Sprinkler.
- J Mini Sprinkler.
- Jain Ghoomar sand separator.
- Venturi Injector.
- Spin Clean disc filter.
- Acurain Opal.
- Jain Fogger.
- J-Bubbler PC.
- Acu-Mister.

Product images were copied into the environment assets for several online emitters. The owner’s last product-card direction: **images smaller, descriptions/specs larger and readable, pertinent manufacturer information only, no AI comments.**

Do not claim the full Jain media library/catalogue is complete.

---

## 13. STAGING / DEPLOYMENT

Known staging hostname from the project is:

`https://jain-irrigation-v5-preview.icy-fire-d2ac.workers.dev`

Historical Cloudflare Workers Builds connection used GitHub and `npx wrangler deploy` from `/cloudflare-ai`. Earlier work used `iteration-05-usable-product` as the Cloudflare production branch for that preview Worker.

**Important:** the current working branch is now `iteration-06-plain-production`. Before telling the owner a new code change is live, verify which branch the Cloudflare preview build is actually following and confirm the resulting deployed commit/version. Do not assume a GitHub commit equals deployment.

The public/production Jain site must remain untouched until explicit production approval.

---

## 14. OLD / REJECTED BRANCH WARNING

Historical PRs/branches labelled DISCARDED (including earlier `iteration-06-field-workspace`, `iteration-07-field-experience`, `field-design-acceptance`, and a discarded old `iteration-05` path) exist as GitHub history. They are not authority and must not be copied wholesale.

The current `iteration-06-plain-production` branch is a later plain/repair build and is a different continuation context. When using older material, take only a specifically verified function/evidence item, not its whole UI/design direction.

---

## 15. NEXT SAFE ACTIONS — ORDER

Continue in this order:

1. **Re-fetch the current head and changed files** on `iteration-06-plain-production`; do not assume this handoff’s listed commit is still HEAD.
2. Finish the **P0 integration repairs** already started:
   - confirm relationship records and parent properties remain synchronized through create/connect/duplicate/delete/proposal-accept;
   - confirm complete-job save fingerprint/envelope;
   - confirm visible storage errors;
   - remove/retire duplicate Design/Materials render paths only after identifying which path is authoritative.
3. Create the requested **plain page-set launcher** with direct links/status to Information, Field/Drawing, Adviser, Design and Materials. It is a test/navigation aid, not a decorative home page.
4. Run **Triple Pass 1** on all pages and repair all code/data/path failures found as a batch.
5. Run **Triple Pass 2** and simplify shell/navigation/page controls. Fix the Information wording/progressive-disclosure batch.
6. Run **Triple Pass 3** for map/product assets/mobile/render/cache/deployment.
7. Deploy to staging only after the code-side gates pass.
8. Give the owner one staging page-set link and a short user acceptance checklist.
9. Do **not** ask the owner to test defects that can be found by code inspection first.
10. Do not call the set “production ready” until the owner has tested/approved the staging behaviour.

---

## 16. OWNER USER-ACCEPTANCE CHECKLIST — GIVE ONLY AFTER OUR REPAIRS

When code-side work is complete, ask the owner to do only the real-user actions we cannot prove ourselves:

1. Open the page-set launcher and confirm all six page identities/navigation feel coherent.
2. Enter/update one Information value, refresh, confirm it remains.
3. Field: draw Boundary → Main → Submain → Laterals; connect them.
4. Multi-select laterals; move/rotate/duplicate/delete and confirm controls feel natural.
5. Open Drawing and confirm the same IDs/geometry appear.
6. Move a vertex in Drawing; return to Field and confirm the same object changed.
7. Use lateral layout preview; clear once, then create once.
8. Adviser: request a layout suggestion; ensure it previews first and does not silently mutate design.
9. Accept a preview and confirm it becomes normal canonical geometry with its relationship.
10. Design/Materials: confirm measurements match the field and no false hydraulic PASS/BOM sizing appears.
11. Refresh/reopen and confirm the complete job remains.
12. Repeat the essential map/drawing actions on phone/mobile.

---

## 17. WHAT NOT TO DO NEXT

- Do not start another broad redesign.
- Do not copy BUSY visually; use its structural strengths only: obvious menus, compact work surface, direct selection/search, contextual commands and simple tabular outputs.
- Do not copy TAGRO ECHO or old irrigation UIs wholesale; they contain flaws.
- Do not add more explanatory prose to pages to compensate for unclear structure.
- Do not add login/security friction now.
- Do not treat canvas pixels as engineering geometry.
- Do not infer connections merely because lines touch; explicit relationship is authoritative.
- Do not let AI coordinates become accepted geometry without preview/human acceptance.
- Do not auto-select products from a catalogue search.
- Do not call local-only state “cloud saved”.
- Do not call code-only work browser-tested.

---

## 18. CONTINUATION PROMPT FOR NEXT CHAT

Use this exact operational instruction if needed:

> Continue TAGRO Irrigation OS from `PROJECT_HANDOFF_2026-08-25.md` in `koffykraft/irrigation-tagro-os`, branch `iteration-06-plain-production`. Read the handoff and every file you will change completely before editing. Do not restart architecture or redesign discussion. Finish the code-side P0 repairs, create the plain page-set launcher, perform the documented triple-pass across every permanent page, repair defects in batches, deploy only to staging when the gates pass, and then ask me only for the real-user acceptance tests you cannot perform yourself. Preserve canonical object IDs, deterministic engineering authority, explicit relationships, unknown states, and human acceptance of AI proposals. Do not claim runtime verification without evidence.

---

**Handoff status:** continuation-ready.  
**Runtime acceptance status:** NOT YET COMPLETE for the current repaired branch.  
**Production approval:** NOT GIVEN by this document.
