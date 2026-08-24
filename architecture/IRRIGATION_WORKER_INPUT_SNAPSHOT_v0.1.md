# TAGRO Irrigation OS — AI Worker Input Snapshot v0.1

Status: WORKING DESIGN

## 1. Purpose

The AI Worker should receive a structured, bounded view of the current irrigation job rather than scraping page state or reading unrelated application internals.

## 2. Snapshot sections

A snapshot may contain:

- `task`
- `customer_context`
- `farm_context`
- `plot_context`
- `crop_context`
- `plant_context`
- `water_context`
- `access_context`
- `network_context`
- `hydraulic_results`
- `bom_requirements`
- `product_candidates`
- `commercial_context`
- `preference_signals`
- `proposal_history`
- `learning_evidence`
- `unknowns`

Each section may be absent when irrelevant.

## 3. Task-first rule

The snapshot should be shaped around the present user request.

Examples:

- “Give me laterals for these plants” needs plant geometry, crop/application assumptions, parent network context and hydraulic constraints.
- “Where should I put the valves?” additionally needs paths/access/preferred control points and operating groups.
- “Can I do this for 40,000?” needs current BOM/product/price context and staging tolerance.

The Worker should not receive unrelated state merely because it exists.

## 4. Provenance

Consequential facts should include provenance/status where available so the Worker can distinguish:

- measured geometry
- user description
- accepted design fact
- AI inference
- manufacturer evidence
- learned outcome

## 5. Output boundary

The Worker returns proposals/questions/explanations through the AI Design Proposal contract. It does not directly mutate entity state.

## 6. Governing sentence

**Give the Worker the smallest consequential slice of the entity graph needed for the current design question, with provenance intact, and require all consequential outputs to return as reversible proposals.**
