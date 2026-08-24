# TAGRO Irrigation OS — Co-Design Environment Sign-off

Date: 2026-08-24
Status: ACCEPTED
Project junction: `iteration-06-co-design-environment`
Parent junction: `iteration-05-usable-product`
Governing baseline: `decisions/ENGINE_FRAMEWORK_SIGNOFF_2026-08-09.md`

## Accepted purpose

The irrigation system will now be developed as a conversational, spatial, progressively intelligent **Irrigation Environment** rather than as a sequence of forms or isolated pages.

The farmer, designer, field geometry, deterministic engineering engines, product knowledge and AI adviser co-design the system. The AI does not own accepted truth and does not silently mutate accepted geometry or engineering decisions.

## Accepted environment surfaces

The environment may project shared state through five primary working surfaces:

- `FIELD` — field story, map, objects, plants, water, access and existing reality;
- `DRAWING` — a clean editable engineering projection of the same geometry objects used on FIELD;
- `ADVISER` — conversational interpretation, questions, comparisons and reversible proposals;
- `DESIGN` — engineering state, operating groups, hydraulic checks, assumptions and design maturity;
- `MATERIALS` — BOM requirements, product resolution, Jain/generic alternatives, price/provenance and commercial hand-off.

These are planar surfaces, not data silos. No surface owns private truth.

## Accepted interaction rules

1. The system may begin from any useful evidence: story, crop, boundary, plant positions, existing pump, water source, budget, drawing, photo, map mark or imported record.
2. There is no compulsory universal wizard and no requirement to complete all possible information before useful work begins.
3. The default information depth remains `SUB_MINIMUM`; ask only consequential questions.
4. The adviser must be conversational, practical and plain-spoken. Technical depth is shown when requested or when necessary to explain a design limit.
5. The adviser must understand before prescribing. It must not jump from a crop name or sparse field description directly to a presumed complete design.
6. Assumptions, crop defaults, learned patterns and AI interpretations remain explicitly revisable and must not be presented as confirmed facts.
7. Geometry proposed by AI is shown as a proposal until accepted. Accepted geometry retains stable identity across FIELD and DRAWING.
8. Deterministic engineering results outrank AI guesses. The AI may explain or compare them but may not silently override them.
9. Manufacturer evidence remains distinct from TAGRO policy, learned experience and generic-product reasoning.
10. Farmer context is job-specific and revisable. Ability to pay, willingness to spend, quality ambition, time tolerance, labour tolerance, convenience and future expansion are separate dimensions.
11. The system may trade capital cost against irrigation time, number of operating sections, manual work, energy, convenience or future expansion only when the deterministic design remains valid and the trade-off is explained plainly.
12. Small-field considerations such as single-phase supply or around-2-HP solutions are attentions, not hard design limits.
13. Human engineering is first-class: paths, gates, daily walking, service access, preferred control points, security, machinery movement and future ease may justify a longer route when the consequence is shown.
14. Jain product knowledge is educational as well as commercial. A user may choose generic products after understanding relevant technical differences.
15. Learning may improve questions, ranking and suggestions, but learned patterns are observations/lenses until evidence and acceptance promote them. Learning does not rewrite engineering law or manufacturer limits.
16. The system must preserve installed reality and history. A new calculation may propose a redesign but cannot silently replace installed truth.

## Accepted learning loop

The environment may learn from the chain:

`PROPOSED → ACCEPTED / REJECTED → PURCHASED → INSTALLED → MODIFIED → OPERATED → SERVICED → OUTCOME`

The learning layer may use recurring patterns to decide what to consider or ask next. It must retain provenance and confidence and must not convert a behavioural pattern into a deterministic design rule.

## Accepted Cloudflare / AI boundary

Cloudflare Workers AI is a replaceable reasoning adapter. It receives a structured context assembled from authoritative/shared state, knowledge sources and deterministic results. It returns questions, explanations, comparisons and proposals.

The Worker is not the system of record. Farm/customer/design/product truths remain in their authoritative entities/stores and are supplied by reference/context.

## Build consequence

This junction authorises a fresh UI/environment implementation while preserving the accepted logical engine, provenance model, entity relationships, validated engineering evidence and recoverable V16 implementation.

Existing UI is reference/evidence only and is not a template for the new environment.

## Sign-off

**Conversational learned co-design Irrigation Environment: ACCEPTED as the next working project junction.**

Production deployment is not authorised by this sign-off. New environment work remains staging/review until interaction, engineering and mobile/desktop acceptance gates pass.
