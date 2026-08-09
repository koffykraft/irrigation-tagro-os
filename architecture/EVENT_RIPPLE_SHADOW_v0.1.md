# Event → Ripple → Shadow Architecture v0.1

## Event

An event is a recorded change in understood reality or system state.

Examples:

- boundary measured
- pump changed
- crop added
- valve moved
- map provider failed
- design calculation corrected
- user reports drawing control unusable
- filter placement rejected as inaccessible

Each event records:

- identity
- timestamp
- source
- affected object(s)
- before/after where applicable
- evidence/provenance
- confidence/state
- domain
- originating interface or process

## Ripple

An event is evaluated against dependencies.

If no dependent state changes, the ripple stops.

If dependencies exist, the ripple propagates only through affected relationships.

Examples:

`Emitter discharge changed → lateral flow → submain flow → main flow → operating group → pump/head check → runtime/BOM`

`Color token changed → visual components only`

`Map provider replaced → map adapter and provider tests; irrigation science unchanged`

## Shadow

A shadow is created only when an event reveals a reusable failure pattern, design weakness or dangerous assumption worth remembering.

A shadow contains:

- shadow family/key
- symptom
- root cause or current best explanation
- affected layers
- evidence/events
- prevention rule
- detection rule where possible
- remediation pattern
- status: active / mitigated / retired

## De-duplication rule

Before creating a shadow, search the shadow registry for an equivalent family.

If equivalent, attach the new event to the existing shadow and increase evidence rather than creating another shadow.

Example family:

`UI/MOBILE/CONTROL_OBSCURED_BY_CHROME`

Multiple instances of controls hidden behind navigation remain one shadow family.

## Non-shadow events

Routine change, expected redesign, successful replacement and harmless user preference changes do not automatically create shadows.

## Shadow influence

A relevant active shadow must be consulted during future design or replacement work. It can create tests, constraints or review prompts, but it must not silently become unrelated domain doctrine.
