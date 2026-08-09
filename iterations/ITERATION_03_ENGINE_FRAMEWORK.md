# TAGRO Irrigation OS — Iteration 03: Logical Engine Framework

Status: ACCEPTED / SIGN-OFF CANDIDATE
Starting junction: `iteration-02-page-structure`
Objective: finish the logical framework that decides what the irrigation system needs to know for a specific farmer task, what to ask, when to stop asking, and what maturity of result may honestly be produced.

## Project blind

This iteration is limited to solution-arrival logic and adaptive information requirements.

It does not authorize implementation of final maps, final UI styling, database architecture, hydraulic formula code, BOM/pricing engines, routing, product catalogues or AI provider choices.

## Accepted principles

1. Pages exist to help arrive at a solution and to accept farmer requirements; pages do not determine engineering order.
2. The system identifies the task before asking questions.
3. There is no universal irrigation questionnaire.
4. Facts are requested only when relevant to the active task and present decision.
5. Default information depth is `SUB_MINIMUM`.
6. `SUB_MINIMUM` must still avoid nonsense, false precision and hidden hard-gate failures.
7. Farmer time, knowledge and willingness to measure are constraints.
8. Easy-answer capture is preferred where sufficient: choose, tap, yes/no, photo, speak, map, draw, measure.
9. Existing information is reused before the farmer is asked again.
10. Missing hard gates downgrade/block the result; they are never invented.
11. The engine stops once the requested depth is honestly satisfied and offers deeper investigation rather than forcing it.
12. AI output remains proposed/provisional until accepted through the project decision state.
13. Every material answer is an event and may ripple through declared dependencies.
14. Equivalent workflow failures attach to existing Shadow families rather than multiplying Shadows.
15. Page surfaces are assembled from the active task's required docks; unused pages/docks remain hidden.

## Query depths

- SUB_MINIMUM — default quick useful direction.
- MINIMUM — defensible task result.
- ADEQUATE — normal engineering/design evidence.
- STRETCH — optimization where farmer effort earns value.
- MAXIMUM — deep investigation for complexity/high consequence or explicit farmer preference.

## Core state machine

`NEED IDENTIFIED → SUB-MINIMUM FACTS → CONSTRAINT CHECK → CANDIDATE SOLUTION → DEPENDENCY CHECK → PROVISIONAL RESULT → OPTIONAL STRETCH → FARMER/ENGINEER DECISION → ACCEPTED DESIGN → INSTALLED REALITY`

Not every task proceeds to every state.

## Artifacts in this junction

- `architecture/ADAPTIVE_NEED_QUERY_ENGINE_v1.0.md`
- `app/config/task-profiles.v1.0.js`
- `schemas/need-query-engine-v1.0.schema.json`
- `engine-framework.html`
- `decisions/ENGINE_FRAMEWORK_SIGNOFF_2026-08-09.md`

## Disposition

This branch is a recoverable junction. The logical framework may be used by future UI, AI, map, hydraulic and BOM implementations through contracts. Those implementations remain replaceable and do not alter this accepted logic without a new signed project junction.
