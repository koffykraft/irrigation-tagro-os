# AI Build Protocol v0.1

Before an AI writes or changes implementation code in this repository:

1. Read `doctrine/` completely.
2. Read `architecture/` completely.
3. Read relevant `domain/` files completely.
4. Read `shadows/SHADOW_REGISTRY.md` and check whether the proposed work resembles a known failure family.
5. Treat existing implementation as evidence, not authority.
6. Identify which contracts are stable and which adapters are replaceable.
7. State the affected entities, relationships, events and expected ripple before coding.
8. Do not introduce an isolated page, component, calculation, map object or database record.
9. Preserve provenance and version history.
10. After implementation, record any reusable failure pattern as a candidate shadow only if no equivalent shadow already exists.

## Smallest-element rule

Mothership and Planar principles apply to the smallest meaningful elements.

A button is not merely a button: it invokes an action that may create an event, mutate an entity, change relationships and produce a ripple.

A map mark is not merely decoration: it represents a located entity or evidence and must be traceable.

A calculated number is not merely displayed output: it has inputs, calculation version, assumptions and affected decisions.

## Replaceability check before merge

For every new dependency ask:

- Can this provider/library be replaced?
- What contract would its replacement satisfy?
- Does unrelated domain code need to know which implementation is used?
- If the component fails, what event is emitted?
- Does a known shadow already describe this failure mode?

If the answer exposes hard coupling, redesign before extending the system.
