# TAGRO Irrigation OS — AI Design Adviser v0.1

Status: WORKING DESIGN
Branch: `iteration-05-usable-product`

## 1. Purpose

The AI Design Adviser is the adaptive reasoning layer for irrigation design. It does not own geometry, hydraulic truth, product truth, price truth, customer truth or accepted design state.

Its job is to observe the current field/design context, generate useful alternatives, explain trade-offs, ask only consequential questions, and return proposals that a human may accept, modify, compare or ignore.

The deterministic engines remain authoritative for reproducible calculations and hard constraints.

## 2. Governing split

**Engine says what is true and what passes.**

**AI says what may be worth considering and why.**

**Human decides what becomes accepted design.**

The Adviser must never silently mutate accepted geometry or accepted engineering facts.

## 3. Inputs

The Adviser may consume a structured snapshot containing any available subset of:

- Customer / farmer purpose
- Farm / place / plot identity
- Crop and planting pattern
- Plant locations or planting density
- Mixed-crop relationships
- Field boundary and section geometry
- Water source, tank, pump, source head and existing infrastructure
- Paths, gates, buildings, access routes, obstacles and preferred control locations
- Main, submain, lateral and device geometry
- Pipe sizes, materials, pressure class and operating groups
- Hydraulic results and deterministic warnings
- Product candidates and verified manufacturer characteristics
- Jain product catalogue / product literature / price edition / availability when present
- Kerala PDMC programme/rate evidence when present
- Budget, staging preference and future expansion intent
- Accepted/rejected proposal history for the current job
- Installed/service outcomes from comparable past jobs when evidence quality permits

Missing information is not automatically an error. The Adviser asks only for facts that materially affect the present decision.

## 4. Context is evidence, not coercion

Entering a crop may allow the system to offer starting assumptions for spacing, plant demand, emitter arrangement, application method or operating pattern.

Field area and geometry may allow likely pipe sizes, number of operating sections, valves, filtration and control arrangements to be proposed.

Water-source and tank position may change likely filter, venturi, pump, valve or manifold locations.

Paths, gates, buildings and access preferences may alter the human-operability score of otherwise hydraulically equivalent layouts.

These remain proposals or assumptions unless explicitly accepted. The user must be able to change or reject them.

## 5. First-class human/spatial design objects

The following are design-relevant entities/relationships, not decorative marks:

- path / access route
- gate / entry
- house / shed / pump room
- water source / tank
- preferred control point
- area to avoid
- future expansion area
- existing buried/installed pipe
- wet/dry/steep/problem zone
- farmer operation preference

Adding or changing one of these may trigger a targeted design reconsideration, never an automatic silent move.

Example ripple:

`Path P1 added near Submain S2`

may produce:

`reconsider valve accessibility → compare nearest practical control point → calculate extra pipe/fittings/headloss/cost → present option → await human choice`

## 6. Proposal contract

Every material AI output that could affect design must be returned as a proposal object with at least:

- `proposal_id`
- `proposal_type`
- `target_entity_ids`
- `summary`
- `reasoning_summary`
- `evidence_refs`
- `assumptions`
- `engineering_effects`
- `material_effects`
- `commercial_effects`
- `human_effects`
- `future_effects`
- `confidence`
- `status`
- `actions`

Recommended status lifecycle:

`draft → proposed → compared → accepted | modified | rejected | superseded`

A proposal must not become accepted design merely because it rendered successfully.

## 7. Geometry proposal contract

Conversational requests may produce geometry proposals.

Examples:

- “Put laterals through these plants.”
- “I drew the main; suggest submains.”
- “Keep the controls beside this path.”
- “Run the laterals the other way.”
- “Show a cheaper layout.”

The Adviser returns proposed geometry referencing existing entity IDs and deterministic constraints. The CAD layer renders it as temporary/proposed geometry. The user may move/delete/edit/accept it. Only acceptance converts it into normal persistent geometry.

The Adviser does not directly write accepted CAD geometry.

## 8. Conversational field stories

Natural-language field descriptions are valid evidence inputs.

Example:

> “This is my house plot. Coconut is the main crop. Pepper is on some trees. Banana is only in the wetter corner. The well is beside the road. We want the valves near the path. I can spend about 60,000 now and may extend next year.”

The Adviser may extract candidate facts such as:

- mixed backyard / house plot
- coconut priority = primary
- partial pepper intercrop
- wetter banana zone
- roadside well
- strong control-access preference
- present budget constraint
- future expansion intent

Extracted facts retain provenance and remain inferred until accepted where materially consequential.

## 9. Product intelligence and Jain connection

Jain products must be represented as product knowledge, not only catalogue rows.

A product candidate may expose verified attributes such as:

- manufacturer / family / item code
- product type
- discharge / flow range
- operating pressure range
- pressure behaviour
- filtration requirement
- emitter exponent or hydraulic characteristic where verified
- recommended applications / limitations
- connection method
- compatible pipe or fitting families
- pack size / procurement unit
- source document / edition / effective date
- dealer price edition / availability when known
- PDMC mapping when supported

The Adviser may explain product nuance and compare alternatives, including a generic option, but must distinguish verified manufacturer evidence from inference or learned experience.

Example:

**Why consider product A?**

- more tolerant of pressure variation;
- potentially useful on uneven terrain or longer runs;
- higher initial cost;
- may be unnecessary for a short level block.

The final user may still select a generic emitter.

## 10. Budget-aware design

Budget is a design constraint, not a target to force-fit.

If the requested system is unlikely to fit the budget, the Adviser should say so and offer honest staged or simplified alternatives.

Possible alternatives include:

- irrigate priority crop/plot first
- retain future-capable main but defer laterals/devices
- increase manual operation to reduce automation cost
- split installation into phases
- compare generic and manufacturer-specific products
- reuse verified existing components
- defer secondary crop or expansion zone

The Adviser must be allowed to conclude that a budget is unrealistic for the requested outcome.

## 11. Multi-objective comparison

Design options may be compared across multiple dimensions:

- hydraulic adequacy
- agronomic fit
- initial cost
- future expansion
- material length
- daily operation effort
- maintenance access
- number of valves / operating sections
- energy/pump implications
- reliability / evidence quality

Example:

### Option A — shortest network
- lowest pipe length
- lowest present cost
- controls inside field

### Option B — access-first controls
- additional pipe/fittings
- slightly greater headloss
- valves beside path
- easier daily use and service

### Option C — future-ready
- larger present main / extra valve provision
- higher present cost
- avoids replacing main when adjacent plot is added

The Adviser should explain why the extra present cost exists.

## 12. Adaptive interaction

The UI should surface only the next useful choices near the active object or task.

Examples:

Selecting a Submain may offer:

`Add laterals · Duplicate · Connect · Family · Check sizing · More`

Selecting a Lateral may offer:

`Duplicate · Space · Device · Length check · Parent · More`

If the user asks “give me laterals”, the Adviser may propose spacing/direction/length from known crop and geometry evidence, then render a preview. It should not open a permanent all-purpose form.

## 13. Learning

Learning must be evidence-based and separated from authoritative engineering rules.

Useful learning evidence includes:

- suggestion proposed
- accepted / modified / rejected
- final purchased components
- installed arrangement
- later field modification
- service / maintenance history
- observed performance
- recurring operator preference

Learned patterns may improve ranking and questioning. They must not silently override:

- manufacturer limits
- deterministic hydraulic checks
- verified product specifications
- explicit farmer/designer choices

The system should learn from outcomes, not merely clicks.

## 14. Adviser roles

A single technical Worker may expose several reasoning modes:

- `design_adviser` — layout alternatives and network structure
- `human_engineering_adviser` — access, daily operation, maintenance and control placement
- `agronomy_adviser` — crop/application assumptions and alternatives
- `hydraulic_interpreter` — explains deterministic results and failure reasons
- `product_adviser` — Jain/generic product nuance and compatibility
- `commercial_adviser` — budget, staging and product-cost implications
- `review_adviser` — omissions, contradictions and unresolved assumptions

These modes share one entity graph and one proposal contract.

## 15. Explainability

Every consequential suggestion must be able to answer:

- Why are you suggesting this?
- What evidence are you using?
- What are you assuming?
- What changes if I reject it?
- What does it cost in pipe/fittings/money?
- What does it improve for daily use or future expansion?
- Is this manufacturer evidence, engineering calculation, learned experience or AI inference?

## 16. Failure boundary

If the AI Worker is unavailable, the Irrigation OS must continue to support:

- map and drawing
- geometry editing
- deterministic hydraulics
- network relationships
- BOM quantity generation
- manual product selection
- accepted design persistence

AI failure must not collapse the field-design workflow.

## 17. Example end-to-end interaction

1. User marks coconut trees and a well.
2. User says: “Four emitters per tree; give me laterals.”
3. Crop/device assumptions are checked against known evidence.
4. Deterministic engine calculates candidate flow and permissible lateral constraints.
5. Adviser proposes two lateral orientations.
6. CAD renders both as proposals.
7. User adds a path and says controls should be near it.
8. Adviser recomputes control-placement alternatives and explains extra pipe/cost for accessibility.
9. User chooses one option.
10. Accepted geometry becomes normal CAD objects.
11. BOM updates.
12. Jain product adviser resolves suitable verified products and generic alternatives.
13. Budget adviser compares complete versus staged installation.
14. User accepts a design edition.
15. Purchase/install/service outcomes later become learning evidence.

## 18. Governing sentence

**Observe the field and the farmer's purpose, use deterministic engineering and verified product evidence to bound reality, generate useful alternatives, explain their consequences, let the human choose, and learn from accepted and installed outcomes without converting habit into hidden authority.**
