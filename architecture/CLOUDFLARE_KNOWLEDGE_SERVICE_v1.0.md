# TAGRO Irrigation — Cloudflare Knowledge Service v1.0

Status: WORKING DESIGN

## Purpose
The Cloudflare Worker is the context gateway for the Irrigation AI Adviser. It must expose versioned, provenance-aware knowledge and task context without turning the Worker prompt into the source of truth.

## Separation of authority
The service keeps four knowledge classes distinct:

1. **engineering_evidence** — deterministic formulae, validated tables, hydraulic limits and calculation results;
2. **manufacturer_evidence** — Jain product PDFs, official specifications, diagrams/images and catalogue provenance;
3. **tagro_policy** — Kerala/small-field/cost/human-convenience design biases such as low-head solutions, single-phase preference and <=2 HP preference where technically practical;
4. **experience_evidence** — accepted/rejected proposals, installed designs, field changes and service outcomes.

AI may reason across these classes but must never present policy or learned preference as manufacturer or engineering fact.

## Worker context route
`POST /api/ai/context`

Input should contain only the active task slice:
- customer/farm/project IDs where authorized;
- plot geometry and active selected objects;
- crops/plant points/spacing;
- water source, tank/pump, elevation evidence;
- paths, gates, buildings, access and preferred control points;
- accepted pipe/device network;
- hydraulic results from deterministic engine;
- budget/cost target when supplied;
- current product availability/price edition when available;
- user request and current workflow purpose.

The service returns a context pack with:
- `knowledge_version`;
- `world_profile`;
- `engineering_rules` relevant to the active decision;
- `product_candidates` with provenance and image refs;
- `human_context`;
- `budget_context`;
- `unknowns`;
- `proposal_constraints`;
- `source_refs`.

## AI proposal boundary
The AI returns proposals only. It cannot directly mutate accepted geometry, BOM, price, customer truth or engineering limits.

A proposal may contain:
- geometry preview objects;
- product/device candidates;
- pipe sizing or section alternatives;
- control/filter/venturi placement suggestions;
- access/convenience alternatives;
- staged/budget alternatives;
- questions that materially improve the active decision;
- explanation of trade-offs.

Every proposal must declare why it exists, evidence used, uncertainties, affected entities and expected ripple.

## Knowledge loading
The Worker should load a generated immutable knowledge pack produced from `/knowledge/*.json` plus validated product records. The generated pack is build output; `/knowledge` remains the authored source.

Large PDFs/images are not embedded in prompts. Store normalized facts, page/source references and image asset refs. Retrieve detailed source fragments only when a question requires them.

## Product intelligence
A Jain product record is not complete until it has, where applicable:
- official identity/code;
- family/category;
- image refs;
- manufacturer PDF/page provenance;
- discharge/nozzle options;
- operating pressure range;
- pressure-flow behaviour;
- wetting pattern/diameter;
- filtration requirement;
- connection and compatible pipe;
- use cases and limitations;
- price edition and availability;
- generic-equivalent characteristics.

The AI may recommend a generic solution even when Jain products are known. Jain knowledge exists to deepen understanding and provide concrete options, not to force brand selection.

## Kerala/TAGRO reasoning
The adviser should actively consider, when relevant:
- small and mixed holdings;
- coconut/pepper/banana/fruit/vegetable/intercrop combinations;
- low-pressure and laminar/transitional design opportunities;
- cost and energy efficiency;
- single-phase supply and <=2 HP preference where practical;
- under-tree application, fan jets, micro/mini sprinklers and conventional emitters;
- access paths, houses, sheds, gates and daily walking;
- valve/filter/venturi/control convenience;
- future expansion and the cost of designing for it now;
- realistic budget limits and phased installation.

These are option-generating biases, not hardcoded forced answers.

## Learning
Learn from outcome chains:
`proposed -> accepted/rejected -> procured -> installed -> modified -> serviced -> outcome`

Learning can change ranking, question order and suggestion confidence. It cannot silently alter deterministic engineering rules or manufacturer specifications.

## Availability/failure rule
If AI or product retrieval fails, map/CAD, deterministic hydraulics, accepted geometry and BOM must remain operational. Unknown stays unknown.
