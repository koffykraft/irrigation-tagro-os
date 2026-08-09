# TAGRO Irrigation OS — Adaptive Need & Query Engine v1.0

Status: ACCEPTED LOGICAL FRAMEWORK
Scope: irrigation solution-arrival logic; independent of page styling, map provider, database, AI vendor and hydraulic implementation.

## 1. Governing purpose

The system exists to arrive at a useful irrigation solution for the farmer with the least unnecessary questioning.

A page is not a questionnaire and a questionnaire is not the system. Pages are temporary planar surfaces assembled around the task currently being solved.

The engine must first identify the farmer's present need, then determine which facts can materially change that solution, then ask only for those facts.

## 2. Core rule

**Task → need → dependencies → missing consequential facts → easiest useful question → evidence → solution state.**

The system must never begin with “complete all fields”.

## 3. Query depth

Every task profile can declare five information depths:

- `SUB_MINIMUM` — default. Enough information to avoid nonsense and produce a clearly provisional direction, estimate or next action.
- `MINIMUM` — enough for a defensible task result within declared limits.
- `ADEQUATE` — enough for a normal engineering/design result with material uncertainties resolved.
- `STRETCH` — additional farmer effort used to optimize performance, cost, maintainability, future expansion or confidence.
- `MAXIMUM` — deep investigation where high consequence, complexity or farmer preference justifies it.

The default is `SUB_MINIMUM`.

The engine must not escalate information depth merely because more questions are possible. It escalates only because:
1. the farmer asks for a deeper result;
2. a safety/engineering gate requires it;
3. the current answer remains too uncertain to be useful;
4. a material optimization requires it and the farmer elects to continue.

## 4. Farmer effort is a constraint

Information effort belongs to the farmer, not the software.

The engine treats farmer time, knowledge, willingness to measure, willingness to photograph/map, and ability to answer technical questions as design constraints.

The system should prefer an easily answerable observation over a technically perfect question when both are sufficient for the present decision.

Examples:
- Prefer “How many coconut trees are here?” over “What is the exact irrigated hectare area?” when plant count is the relevant demand driver.
- Prefer “Show where the well is” over asking for coordinates.
- Prefer “Is this pump already installed?” before asking the farmer to read a nameplate.
- Prefer a photo of a pump label over asking the farmer to transcribe every rating.

## 5. Need identification

The first engine act is to identify the requested outcome, not to choose a page.

A need record contains at least:
- task type;
- desired outcome;
- object/area affected;
- whether the work is new, existing, replacement, extension or diagnosis;
- farmer effort preference when known;
- consequence class;
- current maturity target: provisional / design / accepted / installed review.

If the need is already evident from context, do not ask the farmer to restate it.

## 6. Task profiles

Every supported task declares:
- solution it produces;
- dependencies;
- facts by information depth;
- hard gates that cannot be skipped;
- optional optimizers;
- easiest input modes;
- stop conditions;
- outputs and confidence language;
- ripple targets when facts change.

A task profile is replaceable configuration. It must not be embedded in one page.

## 7. Question selection

A missing fact does not automatically become a question.

The engine asks a question only when the answer has sufficient expected value for the present task.

Priority, in order:
1. hard gate — without it the requested result would be unsafe, meaningless or falsely precise;
2. decision-changing uncertainty — likely to change the solution materially;
3. high-value/easy-answer fact — substantially improves the answer for little farmer effort;
4. optimization fact — useful only if the farmer wants to stretch the design.

Low-impact curiosity is not a query.

## 8. Query form

Questions should be presented in the easiest available form:

`Choose · Tap · Yes/No · Number · Speak · Type · Photograph · Mark map · Draw · Measure`

The same underlying fact may have multiple capture methods.

Example: water-source location may be supplied by GPS/map tap, sketch, photograph with context, voice description or imported previous evidence.

## 9. Provenance

An answer produces evidence, not unquestioned truth.

Each answer carries:
- source;
- capture method;
- status: observed / described / measured / inferred / confirmed;
- confidence where useful;
- time;
- object/place association.

AI extraction from speech, photograph or text is `inferred` until the inference is accepted or independently confirmed when material.

## 10. Solution-arrival state machine

The logical engine progresses through:

`NEED IDENTIFIED → SUB-MINIMUM FACTS → CONSTRAINT CHECK → CANDIDATE SOLUTION → DEPENDENCY CHECK → PROVISIONAL RESULT → OPTIONAL STRETCH → FARMER/ENGINEER DECISION → ACCEPTED DESIGN → INSTALLED REALITY`

Not every task reaches every state.

A quick feasibility question may end at `PROVISIONAL RESULT`.
A full installation design may continue to `ACCEPTED DESIGN` and later `INSTALLED REALITY`.

AI proposals never move themselves into `ACCEPTED DESIGN`.

## 11. Stop rule

The engine must know when to stop asking.

At `SUB_MINIMUM`, stop when:
- the current task can produce a useful provisional result;
- no unasked hard gate exists for that result;
- remaining unknowns are explicitly shown;
- the system does not imply greater precision than evidence supports.

Then offer, rather than force, the next useful depth.

Example: “This is enough for a preliminary layout. Two more measurements would let TAGRO check pipe sizing.”

## 12. Hard-gate rule

Some requested results require facts that cannot be waived by convenience.

Examples:
- a hydraulic PASS/FAIL cannot be issued without the inputs required by the governing hydraulic contract;
- an installed-network change cannot silently assume existing pipe size or route;
- a pump compatibility decision cannot invent pump/head/source data;
- an exact BOM cannot be represented as exact when the physical network remains only conceptual.

When a hard gate is missing, downgrade the output instead of inventing the fact.

## 13. Page generation rule

Pages/surfaces follow the active task.

A task may require only three docks from three nominal pages. The system may assemble those docks together on one working surface.

Examples:
- “Can my 1.5 HP pump handle this?” may assemble Pump, Water Source, Active Group Demand and Head/Route evidence without requiring Crop/Soil or BOM pages.
- “How long can this 16 mm lateral be?” may require Device, Spacing, Lateral and Terrain inputs only.
- “Prepare a purchase list for the accepted design” may open Accepted Network + BOM + Catalogue while leaving field capture hidden.

Page order therefore never determines engineering order. Dependencies determine engineering order.

## 14. Existing information first

Before asking a farmer, the engine checks already available evidence:
- current job state;
- prior observations;
- accepted/installed network;
- photos/documents;
- map geometry;
- measurements;
- product data;
- earlier farmer answers;
- connected Farming Systems planes.

Never ask again merely because another page contains the same field.

## 15. Change / Ripple rule

A new answer is an event.

The engine evaluates what depends on it and recalculates only affected solution elements.

A changed emitter discharge can affect plant demand, lateral demand, submain demand, main demand, operating groups, pump checks, runtime and BOM.

A changed tile color affects no hydraulic decision.

## 16. Shadow rule

Questions and workflows may create Shadows when they reveal reusable failure patterns, for example:
- asking farmers for information they cannot reasonably know;
- forcing full forms for small tasks;
- hiding a hard gate behind a “quick” workflow;
- repeatedly asking for a fact already captured;
- presenting inferred AI data as confirmed farmer data.

Equivalent recurrences add evidence to the existing Shadow family rather than creating duplicates.

## 17. Output honesty

Every result declares its maturity and evidence sufficiency.

Suggested result labels:
- `INDICATION`
- `PRELIMINARY`
- `DESIGN-CHECKED`
- `PROPOSED`
- `ACCEPTED`
- `INSTALLED`

`SUB_MINIMUM` normally produces `INDICATION` or `PRELIMINARY`, never an implicitly final design.

## 18. Minimum questions are task-specific

There is no universal minimum irrigation form.

Minimum information belongs to a task, not to the irrigation application as a whole.

Therefore:
- all queries are not required for all tasks;
- all pages are not required for all tasks;
- all docks are not required for all tasks;
- the farmer may stop after a useful lower-depth answer;
- the farmer may stretch deeper where value justifies effort.

## 19. Engine boundary

This framework defines *what the system needs to know and when to ask*. It does not prescribe:
- final UI styling;
- map provider;
- database;
- AI model;
- hydraulic formula implementation;
- product catalogue;
- pricing;
- final page order.

Those components dock into the engine through contracts.

## 20. Governing sentence

**Ask only what the present decision needs; default to sub-minimum effort; never confuse a provisional answer with accepted reality; allow the farmer to stretch the solution only where the added effort earns value.**
