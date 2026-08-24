# TAGRO Irrigation OS — Conversational Co-Design Environment v1.0

Status: WORKING IMPLEMENTATION CONTRACT
Project junction: `iteration-06-co-design-environment`
Parent framework: `ADAPTIVE_NEED_QUERY_ENGINE_v1.0`
Related: `REFLECTIVE_DATA_CAPTURE_v1.0`, `PAGE_SURFACE_MODEL_v0.1`

## 1. Purpose

The Irrigation Environment is a shared working space where field reality, drawing, conversation, engineering and materials remain connected through one underlying entity/event state.

The environment is not a linear wizard. It must support useful entry from any available evidence while progressively increasing design maturity only when the active purpose needs it.

## 2. Five primary projections

### FIELD
Shows and captures real-world context: boundary, plant/crop objects, water source, tank, pump, paths, gates, buildings, obstacles, existing pipes/controls, photographs/notes and rough/full geometry.

### DRAWING
Shows the same geometry/entity objects without requiring map imagery. It is a clean engineering workspace, not an exported copy. Edits continue against the same stable object identities.

### ADVISER
Holds the conversation state: farmer words, current understanding, one next consequential question when needed, comparisons, reversible geometry/design proposals, explanations and optional deeper technical detail.

### DESIGN
Projects deterministic calculations and accepted/proposed design state: demand, operating groups, pipe/device assignments, permissible-length checks, pressure/head, runtime, assumptions, unresolved gates and maturity.

### MATERIALS
Projects requirements and resolution: geometry-derived quantities, accessories/connections, Jain/generic product candidates, price editions, provenance, unresolved selections and commercial hand-off.

## 3. Shared-state invariant

`ONE REAL OBJECT → ONE STABLE IDENTITY → MANY SURFACE PROJECTIONS`

A lateral drawn on FIELD and edited on DRAWING remains the same lateral. A valve appearing on MATERIALS is a material consequence of the same accepted network object, not a second valve record.

## 4. Conversational state machine

The adviser follows:

`LISTEN → REFLECT → CHECK CONSEQUENCE → ASK OR OFFER → PROPOSE → HUMAN ACCEPT / MODIFY / REJECT → DETERMINISTIC VALIDATION → RIPPLE`

Rules:

- Do not ask merely because a schema field is empty.
- Prefer one consequential question at a time.
- Prefer ordinary language.
- Reflect what was understood before prescribing where this helps the farmer correct the system.
- A sparse description may produce an indication or preliminary concept, never false precision.
- Technical detail is available on demand through Why / Compare / Show calculation / Show source.

## 5. Farmer-context model

Farmer context is current job evidence, not identity profiling.

Keep separate where known:

- desired outcome;
- stated budget and flexibility;
- quality ambition;
- willingness to spend;
- affordability constraint;
- time/irrigation-window tolerance;
- manual-work tolerance;
- convenience priority;
- future-expansion intent;
- desired explanation depth;
- farmer wording and corrections.

Unknown remains unknown. The adviser must not infer wealth, seriousness, technical competence or willingness from appearance, identity or location.

## 6. Proposal contract

AI output that could change design is a `proposal` containing:

- proposal identity/version;
- trigger/user request;
- affected entity IDs;
- proposal kind;
- plain-language summary;
- reasoning separated into engineering/product/TAGRO-policy/learned-observation/human factors;
- assumptions and unknowns;
- deterministic checks required;
- geometry patch or design patch, if any;
- material/cost/time/labour/energy/convenience/future-expansion consequences where known;
- source references;
- confidence;
- status = proposed until explicit acceptance.

The AI may create proposals; only user/authorised workflow may promote them to accepted design state.

## 7. Learning contract

The learning system may form observations from repeated outcomes, for example:

- certain field shapes often benefit from more operating groups;
- customers frequently move controls toward a path after initial design;
- a product family performs reliably or causes recurring service issues under specific conditions;
- a lower-capital option is often accepted when additional operating time is acceptable.

Learning may:

- influence what the adviser considers;
- rank which question is worth asking;
- suggest comparisons;
- surface a likely human factor;
- offer a previously successful pattern as a proposal.

Learning may not:

- silently select pipe size or emitter;
- override deterministic engineering;
- override manufacturer limits;
- turn a farmer into a fixed behavioural profile;
- convert correlation into fact;
- mutate installed/accepted design without approval.

## 8. Product-intelligence contract

Product knowledge must support comparison, not catalogue dumping.

A product record may include:

- identity/manufacturer/family/model;
- image/document references;
- application category;
- discharge/nozzle/pressure behaviour;
- wetting geometry;
- filtration requirement;
- connection/compatible pipe;
- operating range;
- use cases stated by manufacturer;
- limitations/cautions;
- source page/document/version;
- price edition/availability when connected;
- generic equivalence attributes;
- learned field observations stored separately from manufacturer facts.

The adviser presents only the product distinctions relevant to the current farmer/design decision.

## 9. Cost/time/complexity trade-offs

The environment must be able to compare technically valid alternatives such as:

- larger pipe / fewer sections / shorter operating time / higher capital;
- smaller pipe / more sections / longer operating time / lower capital;
- more automation / less daily labour / higher cost;
- control point beside shortest hydraulic route versus beside access path;
- current minimum versus future-ready main sizing;
- Jain named product versus generic equivalent.

No trade-off is offered as viable until required deterministic checks pass for that alternative.

## 10. Human engineering

Human factors are spatial design inputs when material:

`PATH · GATE · HOUSE · SHED · ROAD · SERVICE ACCESS · DAILY WALKING · MACHINE ROUTE · SECURITY · PREFERRED CONTROL POINT`

A human-centred alternative may intentionally use more pipe or fittings. The environment must state the additional material/cost/head consequence and the operational benefit rather than treating shortest geometry as automatically best.

## 11. Object interaction model

Selecting an object should expose actions that make sense for that object and current task.

Examples:

- Submain: add laterals, inspect family, move/extend, split, size/check, set control preference.
- Lateral: duplicate, spacing, device assignment, permissible-length check, parent, move/extend.
- Device: compare emitter/jet/sprinkler options, discharge, placement, wetting pattern.
- Path: mark access importance, keep clear, prefer controls near path.
- Plant/crop group: assign/confirm crop, spacing, priority, application intent.

Do not expose every possible parameter at once.

## 12. Offline/degraded behaviour

The environment should remain useful when AI, catalogue, pricing or network connectivity fails.

- geometry/state remains editable locally;
- deterministic calculations remain available when their engine is local/bound;
- AI-unavailable state leaves questions/proposals unavailable but does not block drawing;
- product-unavailable state keeps generic requirements and unresolved product slots;
- sync events queue until connectivity returns.

## 13. Cloudflare adviser boundary

The Cloudflare AI Worker receives a structured context pack rather than raw whole-system state. Context selection follows the active task and only includes relevant evidence.

Worker responsibilities:

- assemble/receive relevant context;
- retrieve relevant knowledge;
- produce conversational response/proposals;
- cite source/provenance where specific claims are made;
- return structured proposal objects where geometry/design changes are suggested.

Worker non-responsibilities:

- own accepted field/design truth;
- perform silent writes to accepted geometry;
- replace deterministic engineering;
- create commercial transactions directly;
- infer missing critical facts as known.

## 14. Initial implementation target

The first environment shell must prove these invariants before deeper styling or production integration:

1. FIELD and DRAWING render the same object state.
2. A new main/submain/lateral drawn in one surface appears in the other without export/copy.
3. Selecting an object gives contextual actions.
4. Adviser conversation asks/reflects rather than dumping forms.
5. AI geometry suggestions are visibly proposed and require acceptance.
6. DESIGN and MATERIALS are projections of the same current state.
7. UI remains map/drawing-first with top-right primary work access and minimal persistent chrome.

## 15. Governing sentence

**The farmer and designer should feel they are working on the field and its irrigation, not operating software: show the shared reality, ask only what matters, propose without taking control, explain trade-offs plainly, and let intelligence deepen as evidence accumulates.**
