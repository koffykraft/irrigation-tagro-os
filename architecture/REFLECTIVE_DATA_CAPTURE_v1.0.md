# TAGRO Irrigation OS — Reflective Data Capture v1.0

Status: WORKING DESIGN
Parent framework: `ADAPTIVE_NEED_QUERY_ENGINE_v1.0`
Project junction: `iteration-04-reflective-capture`

## 1. Purpose

Data capture is not clerical work. It is part of solution arrival.

The farmer should leave a capture session with a clearer understanding of the farm, the purpose of the intervention and the choices being made — even before TAGRO produces an irrigation design.

The capture experience therefore has two simultaneous jobs:

1. gather the smallest consequential evidence required by the active task;
2. help the farmer see relationships, motives, trade-offs and uncertainty in his or her own farm.

The system must not turn this into a long questionnaire.

## 2. Core projection

The engine and purpose sit at the centre.

Information flows inward as ripples from the farm:

`Farmer purpose / task ← objects + relationships + motives + evidence + constraints + observations`

The same object can have different meanings depending on relationship and purpose.

Example: `banana` is not sufficient information by itself.

Banana may be:
- a sole crop;
- an intercrop under coconut;
- temporary establishment cover;
- primarily for household food;
- primarily for sale;
- additional income while another crop matures;
- weed suppression / ground occupation;
- a cultural or customary practice;
- a combination of these.

These meanings are associated data. They affect how much irrigation attention banana should receive, whether yield maximisation is desirable, whether permanence matters and how cost should be allocated.

The system must capture the relationship and purpose without forcing the farmer to think in database terminology.

## 3. Capture atom

A useful capture atom has five separable parts:

`THING → RELATIONSHIP → PURPOSE / MEANING → EVIDENCE → IMPORTANCE`

Example:

- Thing: Banana patch
- Relationship: Intercrop with coconut
- Purpose: Household food + some sale + weed suppression
- Evidence: Farmer description
- Importance: Coconut remains primary; banana is supportive

These are separate facts linked together. They must not be flattened into one text field or inferred as one permanent truth.

## 4. Joy rule

A capture surface should feel more like arranging thoughts than filling a government form.

Prefer:
- one thought at a time;
- large obvious choices;
- familiar words;
- tap/choose before typing;
- photographs, speech, map marks and simple sketches where easier;
- immediate reflection of what the system understood;
- visible progress toward a useful answer, not progress through a form;
- easy correction;
- optional depth;
- examples based on farm reality;
- a clear reason when a technical question is unavoidable.

Avoid:
- grids of blank fields;
- long forms;
- required-field stars everywhere;
- technical terminology before it is needed;
- asking the farmer to convert observations into engineering units unnecessarily;
- asking the same fact twice;
- hiding why a question matters;
- treating skipped optional questions as incomplete work.

## 5. Reflection loop

Each meaningful answer should be allowed to produce a small reflection:

`ASK → ANSWER → UNDERSTANDING → RIPPLE → NEXT BEST QUESTION`

Example:

Question: “What is banana doing for you here?”

Farmer chooses:
- Food for home
- Some income
- Keeps the ground occupied / weeds down

System reflection:
> “So banana is useful here, but it is not the main crop. TAGRO should avoid designing the whole irrigation system around maximum banana yield.”

That reflection is a proposed interpretation, not confirmed truth. The farmer can accept, change or ignore it.

## 6. Purpose first, specification later

Questions should move from human purpose toward engineering only as necessary.

Preferred progression:

1. What are you trying to achieve?
2. What is here now?
3. What matters most here?
4. What limits you?
5. What can change and what must stay?
6. Only then: the measurements/specifications that materially affect the solution.

The engine may enter at any point if earlier information already exists.

## 7. Question families

### A. Purpose
Examples:
- “What would make this irrigation worthwhile for you?”
- “Is the priority yield, saving labour, surviving summer, using less water, or something else?”
- “Does this need to be cheap now, or easy to expand later?”

### B. Role / relationship
Examples:
- “Is banana the main crop here, or growing with another crop?”
- “Which crop should get priority if water becomes short?”
- “Is this pump already serving the house or another field?”

### C. Reality
Examples:
- “What is already installed?”
- “Show where the well is.”
- “Which area dries first?”

### D. Preference / tolerance
Examples:
- “Would you rather open valves manually or keep daily work low?”
- “Would you accept more sections if it lets the existing pump work?”

### E. Stretch
Examples:
- “Want to improve this for future expansion too?”
- “If you can show the pump label, TAGRO can check this more closely.”

## 8. Thinking-tool behaviour

The capture surface should periodically show a simple current picture such as:

- What you seem to want
- What the farm appears to be asking for
- What is fixed
- What is flexible
- What TAGRO still does not know
- What one more answer would improve

This is not a final report. It is a mirror for the farmer and designer.

The farmer should be able to correct any reflected interpretation.

## 9. Multiple meanings are first-class

An object can carry multiple purposes at once.

Purposes should support:
- multiple selections;
- relative importance;
- primary / supporting / incidental role;
- seasonal change;
- uncertainty;
- farmer wording preserved alongside normalized system categories.

Do not force a single purpose merely because software prefers one value.

## 10. Relationship before duplication

If banana is intercropped with coconut, do not create a second unrelated farm truth called “banana field” unless there really is a separate field.

Represent:

`Patch A contains Coconut`
`Patch A contains Banana`
`Banana intercropped_with Coconut`
`Coconut priority = primary`
`Banana purposes = [food, supplemental_income, weed_suppression]`

Views may display this differently, but the underlying objects and relationships remain shared.

## 11. Ripple inward

Every accepted observation can ripple toward the active purpose.

Example:

`Banana role changes from main crop → supporting intercrop`

Possible affected elements:
- crop priority;
- application-device optimization;
- operating schedule;
- water allocation under scarcity;
- cost allocation;
- future expansion assumptions.

It should not automatically affect unrelated facts such as map provider or pump nameplate evidence.

## 12. Capture depth

The signed engine depth rules remain unchanged.

At `SUB_MINIMUM`, capture only enough associated meaning to prevent a misleading solution.

For example, if the task is only “Can this pump irrigate the coconut block?”, knowing every use of the banana intercrop may be unnecessary. A single easy question such as “Should banana receive the same irrigation priority as coconut?” may be enough.

If the farmer chooses to stretch into crop planning, the richer purpose structure can be opened.

## 13. Answer modes

Each question can expose the easiest relevant modes:

`Choose · Tap · Rank · Yes/No · Number · Speak · Type · Photograph · Mark · Draw · Measure`

Typing should usually be the fallback, not the default.

## 14. Reflection provenance

Keep separate:
- farmer statement;
- system-normalized category;
- AI interpretation;
- farmer acceptance/correction.

Example:

Farmer words: “We always keep some banana there; it gives fruit for the house and stops the place becoming wild.”

Normalized candidates:
- household_food
- weed_suppression
- cultural_practice

These remain `inferred` until accepted where materially relevant.

## 15. Calm stopping point

A capture session should end naturally when the active task has enough information.

The surface should say what can be done now, for example:

“Enough for a preliminary irrigation concept.”

Then offer one small stretch:

“Show the pump label to check whether the same concept suits your existing pump.”

The farmer should never feel that an unfinished optional path means failure.

## 16. Design primitives

Recommended reusable capture primitives:

- `NeedCard` — what are we trying to solve?
- `ChoiceChips` — familiar multi/single choice
- `RelationshipCard` — how are two things connected?
- `PurposeStack` — multiple purposes with relative importance
- `PriorityPair` — if there is a conflict, which matters more?
- `ShowMeCard` — photo/map/draw instead of describe
- `QuickMeasure` — one consequential measurement
- `ReflectionCard` — what TAGRO currently understands
- `UnknownCard` — one meaningful unresolved uncertainty
- `StretchOffer` — optional added effort and its value
- `CorrectionCard` — “That is not what I meant”

All primitives are docks/views over shared state and remain replaceable.

## 17. Governing sentence

**Capture should help the farmer think, not make the farmer serve the database. Ask in the farmer's language, preserve the farmer's meaning, reveal relationships, and stop as soon as the present purpose can be served honestly.**
