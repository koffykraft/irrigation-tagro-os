# Irrigation — TAGRO OS

This repository is a new irrigation-domain implementation under TAGRO OS doctrine.

It must not inherit UI, architecture, database, map, page, component, or workflow assumptions from earlier irrigation applications merely because they already exist.

## Governing idea

The irrigation system is a dock on the TAGRO Farming Systems mothership. It is not an isolated application.

Every object, page, control, calculation, event, map mark, database record, and design decision must participate in relationships with the rest of the system.

The governing principles are:

1. **Mothership / Spaceship** — the farm/system is the durable host; capabilities dock into it and remain replaceable.
2. **Planar** — one fact or event may be interpreted across many planes without duplicating reality.
3. **Flux** — change is expected. Designs, observations and components are versioned and redesignable.
4. **Ripple** — an event must be able to propagate consequences through its dependency graph.
5. **Shadow** — failures and poor design decisions must leave reusable institutional memory so equivalent mistakes are not recreated.
6. **Replaceability** — every component must be replaceable without requiring the entire system to be rebuilt.
7. **Provenance** — observation, inference, proposal, acceptance and installed reality are never silently conflated.

## Repository structure

- `doctrine/` — immutable direction and governing rules
- `architecture/` — replaceability, interfaces, relationships and boundaries
- `domain/` — irrigation-domain logic
- `schemas/` — machine-readable contracts and event structures
- `shadows/` — known failure patterns and lessons
- `decisions/` — accepted architectural decisions
- `ideas/` — ideas not yet promoted to doctrine
- `tests/` — conformance and regression tests

## First rule for AI

Before designing or modifying this system, read the doctrine and architecture files completely. Do not infer the intended design from existing code. Existing code is evidence, not authority.

## Relationship to TAGRO OS Think

The wider philosophy lives in `koffykraft/tagro-os-think`. This repository applies that thinking specifically to irrigation while keeping irrigation one domain among many in TAGRO Farming Systems.
