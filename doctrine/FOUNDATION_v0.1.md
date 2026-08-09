# TAGRO Irrigation OS — Foundation Doctrine v0.1

Status: FOUNDATION

## 1. Irrigation is not the mothership

The farm and its operating context are the mothership. Irrigation is one dock among many: soil, water, weather, crop, nutrition, labour, machinery, power, finance, access, maintenance, market and household/commercial use.

Irrigation may consume and contribute information across those planes, but it must not own facts that belong elsewhere.

## 2. Nothing is isolated

No meaningful component is permitted to exist without relationships. A map point, valve, plant block, pump, field section, page control or database record must be able to identify what it belongs to, what it affects, what affects it, and what evidence created it.

## 3. Flux is normal

The system must expect continuous update and redesign. New evidence may affect one object, one plot, one operating group or the whole system. Recalculation must be scoped to the dependency ripple rather than blindly rebuilding everything.

## 4. Facts and design decisions are different

Internally distinguish at minimum:

- observed
- measured
- described
- inferred
- confirmed
- proposed
- accepted
- installed
- superseded

Installed reality is not silently rewritten because a new calculation prefers something else.

## 5. Ripple

Every accepted event enters an event stream. The system determines whether the event has downstream consequences. A ripple may be local or system-wide. An event does not need to create a ripple if no dependency is affected.

## 6. Shadow

A bad design choice, failed component, broken workflow, inaccessible placement, invalid calculation, misleading UI, lost data path or architectural dead-end may create a shadow.

A shadow is structured memory of a failure pattern and its cause. It exists to prevent recurrence, not merely to record blame.

Equivalent events must consult existing shadows before creating a new one. One failure family should not generate endless duplicate shadows.

## 7. Replaceability

Maps, tile providers, drawing engines, navigation, colors, component sizes, sidebars, databases, storage, authentication, calculations, AI models and page layouts are replaceable adapters unless explicitly promoted to a stable domain contract.

No UI library, map vendor or database technology becomes architectural doctrine.

## 8. Human engineering

Hydraulic correctness alone is insufficient. Placement and operation must consider access, paths, gates, maintenance, labour availability, mechanisation, safety, affordability and the actual human use of the farm.

## 9. Explainability

A design recommendation must be traceable to evidence, assumptions, dependencies and calculations. AI inference must not be presented as measured fact.

## 10. Versioning

Doctrine, schemas, calculations and designs are versioned. Historical states remain recoverable. The current design is a present interpretation of known reality, not permanent truth.
