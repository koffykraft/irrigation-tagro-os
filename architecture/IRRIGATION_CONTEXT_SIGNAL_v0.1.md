# TAGRO Irrigation OS — Context Signal Contract v0.1

Status: WORKING DESIGN

## 1. Purpose

Field context should influence design suggestions without becoming hidden hard-coded rules.

A context signal is a piece of evidence that may alter what the Adviser considers useful, practical or worth asking next.

## 2. Signal families

Examples include:

- crop / crop mix
- planting spacing / plant locations
- field area / shape
- water source / tank / pump position
- paths / gates / access routes
- buildings / pump room / shed
- preferred control position
- areas to avoid
- future expansion zone
- budget / staging preference
- labour / manual-operation tolerance
- water scarcity / scheduling constraint
- existing infrastructure
- terrain / elevation evidence
- installed/service history

## 3. Signal structure

A context signal should carry:

- `signal_id`
- `signal_type`
- `entity_ids`
- `value`
- `status`
- `source`
- `confidence`
- `effective_from`
- `notes`

Recommended status vocabulary:

- observed
- measured
- described
- inferred
- confirmed
- proposed
- accepted
- installed
- superseded

## 4. Suggestion effect

Signals should alter proposal ranking or open new considerations rather than force a design.

Examples:

`crop = coconut`
may offer typical planting/emitter starting assumptions.

`path near submain`
may increase the desirability of a valve/control point near the path.

`future expansion area`
may produce a future-capacity main option.

`budget below full design estimate`
may produce staged-installation alternatives.

`preferred control point`
may produce a comparison between shortest hydraulic route and easiest operation.

## 5. Explainable ripple

When a context signal materially changes a proposal, the Adviser should name the signal in its reasoning summary.

Example:

“Valve option B is suggested because the farmer marked Path P1 as the preferred daily access route. It adds 7.4 m of 40 mm pipe compared with option A.”

## 6. Modification and removal

Signals are editable. Removing a path, changing a crop, moving a tank or revising a budget may trigger reconsideration of only dependent proposals.

No accepted geometry should be moved silently.

## 7. Learning

Repeated accepted outcomes may improve the ranking of context-sensitive proposals, but learned ranking remains evidence with provenance. It does not become an invisible fixed rule.

## 8. Governing sentence

**Context should make the system more attentive, not more authoritarian: observe what matters, explain how it changes the options, and leave the design choice visible and reversible.**
