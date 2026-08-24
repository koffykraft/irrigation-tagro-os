# Anonymous Irrigation Job Persistence v1.0

Status: staging contract. No production deployment authorised.

## Purpose

Allow the Irrigation Environment to save and reopen work without login, accounts or a `users` table.

The system identifies the **job**, not the person.

## Access model

Creating a job returns:

- a random `job_id`;
- a cryptographically strong random access token shown only to the client;
- a resumable private job link or equivalent client-held capability.

The database stores only a one-way hash of the access token. The raw token must never be stored in D1, logs, learning evidence, analytics or AI context.

Possession of the valid job token grants access to that job. This is intentionally a staging/simple-access capability model, not a permanent substitute for later TAGRO identity or customer permissions.

## Data boundaries

`irrigation_jobs`
: job identity, maturity and state version only.

`irrigation_job_snapshots`
: versioned shared Environment state. FIELD and DRAWING remain projections of the same state.

`irrigation_events`
: append-style facts about actions and changes.

`irrigation_proposals`
: AI/human design proposals and their resolution. Proposed is not accepted.

`irrigation_learning_evidence`
: accepted/rejected/modified proposals, stated preferences, installation/service observations and outcomes.

There is deliberately no irrigation-private customer/user master table.

## Learning boundary

Learning evidence defaults to `scope=job` and `may_generalize=false`.

A statement such as “keep valves near the path” can influence later reasoning for this job. It cannot become a regional or organisational design rule because one farmer selected it.

Manufacturer evidence and deterministic engineering always outrank learned observation for factual/product/hydraulic claims.

## Save semantics

A safe save is optimistic and versioned:

1. client sends current `state_version` plus changed state/events;
2. Worker verifies the job capability token;
3. Worker rejects stale-version overwrite rather than silently discarding newer work;
4. Worker writes a new snapshot/version and events transactionally;
5. Worker returns the new state version.

## AI context

The adviser may receive only relevant, bounded learning evidence for the active job. It must be labelled as learned observation, with provenance and state. The adviser must not be given the raw access token.

## Offline / local-first

Browser-local work remains valid when D1/network is unavailable. Pending events can later be synchronized against the last known state version. Conflict handling must preserve both sides or ask for resolution; it must not silently choose one.

## Future identity

If TAGRO/branch/customer identity is added later, authentication is an adapter around this job capability model. Existing job IDs, events, proposals and evidence must not need to be rewritten merely because identity becomes richer.

## Security limitations for staging

Until stronger identity/access policy is enabled:

- avoid storing unnecessary sensitive personal/payment information;
- use high-entropy tokens;
- hash tokens before persistence;
- never expose tokens to AI prompts or logs;
- allow explicit token rotation/revocation later;
- keep production/customer data out of this preview environment.
