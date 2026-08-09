# TAGRO Irrigation OS — Logical Engine Framework Sign-off

Date: 2026-08-09
Status: ACCEPTED
Project junction: `iteration-03-engine-framework`
Parent junction: `iteration-02-page-structure`

## Signed-off scope

The logical framework governing how the irrigation OS identifies a farmer task, determines relevant information requirements, asks adaptive questions, stops questioning, produces a maturity-qualified result, and reuses pages/docks as planar solution surfaces is accepted as the baseline for future irrigation-system implementation.

## Accepted rules

1. There is no universal irrigation form.
2. The active task determines the required information.
3. Default query depth is `SUB_MINIMUM`.
4. The system asks only consequential questions for the present task.
5. Existing evidence is reused before asking again.
6. Farmer effort is a design constraint.
7. Questions should be easy to answer and may use choose/tap/yes-no/number/speech/text/photo/map/draw/measure.
8. Hard engineering gates cannot be skipped or invented; missing gates downgrade or block the result.
9. The system must stop when the requested information depth is honestly satisfied.
10. Additional depth is offered, not forced, unless a hard gate requires it.
11. Pages are planar solution-arrival surfaces assembled from relevant docks; page order does not determine engineering order.
12. State remains shared; no page owns truth.
13. AI-generated designs remain provisional/proposed until explicitly accepted.
14. Events trigger dependency-aware ripple only where relationships require it.
15. Installed reality is preserved and is never silently overwritten by a new calculation.
16. Reusable failures are recorded through de-duplicated Shadow families.
17. Maps, drawing engines, databases, AI models, hydraulics implementations, BOM engines, catalogue/pricing and visual design remain replaceable components outside this logical framework.

## Reference artifacts

- `architecture/ADAPTIVE_NEED_QUERY_ENGINE_v1.0.md`
- `app/config/task-profiles.v1.0.js`
- `schemas/need-query-engine-v1.0.schema.json`
- `iterations/ITERATION_03_ENGINE_FRAMEWORK.md`
- `engine-framework.html`

## Change control

Any future change to the principles above is a material change to the irrigation-system engine and must create a new project junction with explicit sign-off. Conversation, experimentation or implementation convenience does not modify this signed framework.

## Sign-off

**Logical framework: ACCEPTED for use as the governing baseline of subsequent irrigation OS builds.**

This sign-off does not approve any particular UI, page order, map provider, database, hydraulic formula implementation, product catalogue, BOM implementation, AI provider or production deployment.
