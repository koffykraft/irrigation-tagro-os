# TAGRO Irrigation Environment v1 — Working Shell

Status: WORKING / STAGING ONLY
Project junction: `iteration-06-co-design-environment`

This directory is a fresh UI/environment implementation. It does not reuse the V16 layout and does not replace `location-map.html`.

## What this shell currently proves

- blank field by default; no pre-populated irrigation network;
- top-right first-finger `+` work access;
- drawing tools for boundary, main, submain, lateral, plant, water source and path;
- stable object IDs;
- FIELD and DRAWING are two renderers of the same in-memory objects;
- drawing can continue on either surface;
- object selection exposes contextual actions rather than a universal form;
- main can hand off conversationally to “ask for submains”;
- submain can hand off conversationally to “ask for laterals”;
- path can record a user preference to consider controls near it without moving controls automatically;
- DESIGN refuses fake metre lengths or hydraulic PASS/FAIL while map scale/hydraulic engine are unbound;
- MATERIALS derives only the requirements actually implied by drawn objects and leaves sizes/products unresolved when evidence is missing;
- Adviser uses the Cloudflare context service when ready;
- if AI is unavailable, the surface says so and uses only a local conversation guide that asks non-presumptive questions. The local guide does not make engineering/product claims.

## Not yet claimed

- no real map/tile/GPS adapter is connected;
- canvas coordinates are not metres;
- deterministic hydraulics are not yet docked into this shell;
- AI geometry proposals are not yet normalized into a strict response schema;
- Jain product retrieval is seeded but not yet the complete catalogue/knowledge base;
- persistence/offline sync is not yet wired;
- no runtime mobile/desktop acceptance test has yet been completed;
- no production deployment is authorized.

## Staging Worker

`cloudflare-ai/wrangler.jsonc` targets `jain-irrigation-v5-preview` and serves this directory through Workers Static Assets while the Worker handles `/health` and `/api/*`.

The live `jain-irrigation` / `jain.tagro.in` Worker is not targeted by this configuration.

## Required acceptance checks before calling the shell usable

### Geometry continuity

1. Open FIELD on blank state.
2. Draw one boundary, one main, two submains and several laterals.
3. Open DRAWING.
4. Confirm the exact same IDs/objects appear.
5. Add a lateral in DRAWING.
6. Return to FIELD and confirm the same lateral appears without export/reload.
7. Select first and second pipe independently.
8. Duplicate and delete an object; confirm both surfaces update.

### Conversational behavior

1. Say only “coconut”.
2. Confirm the adviser does not assume spacing/emitter/pump.
3. Give a budget concern.
4. Confirm the next question distinguishes cost from acceptable time/manual work rather than forcing a cheap design.
5. Mark a path and choose “Prefer controls near here”.
6. Confirm this becomes a preference/relationship, not an automatic geometry move.
7. Ask for laterals from a submain with insufficient context; confirm the system asks for plant/spacing logic rather than drawing arbitrary lines.

### Honesty gates

1. Open DESIGN after drawing pipes on the unscaled canvas.
2. Confirm no metre lengths are claimed.
3. Confirm no hydraulic PASS/FAIL is claimed.
4. Open MATERIALS and confirm only segment/device counts are shown when lengths/sizes/products remain unresolved.
5. Disable/omit AI model and confirm Adviser reports that AI is not connected/ready.

### Mobile

- test at two real phone viewport sizes with browser chrome present;
- top-right work button must remain reachable;
- no persistent bottom sheet covering the drawing;
- text must remain readable without shrinking below practical field use;
- surface menu/work menu/selection card must close without traps;
- drawing canvas must retain most of the viewport.

### Desktop

- test at 1440×900;
- canvas remains primary;
- no permanent empty sidebars;
- work menu is contextual and dismissible;
- FIELD/DRAWING transitions preserve selection/object identity.

## Next docking steps

1. deploy this shell to `jain-irrigation-v5-preview`;
2. bind/select a Workers AI model and test conversational behavior;
3. dock the accepted deterministic hydraulics through a replaceable adapter;
4. dock real map/measurement geometry without changing object identity;
5. normalize AI proposal responses so proposed geometry can be previewed/accepted/rejected;
6. expand Jain knowledge and images from verified source documents;
7. add persistence/offline event queue only after interaction model is accepted.
