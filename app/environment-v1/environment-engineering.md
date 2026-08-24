# Environment engineering adapter

`environment-engineering.js` is a thin browser adapter over the deterministic Worker routes.

It does not contain hydraulic formulae. It exists so the UI can ask the engineering dock for conformance and checks without duplicating numerical truth into the page.

The environment must remain usable when this adapter is offline. In that case DESIGN shows engineering as unavailable/unknown; it does not synthesize a result locally.
