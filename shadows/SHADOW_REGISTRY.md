# Shadow Registry

This registry prevents known failure patterns from being recreated.

Do not create a new shadow until existing families have been checked.

| Shadow key | Status | Meaning | Prevention |
|---|---|---|---|
| `ARCH/LEGACY_ASSUMPTION_AS_AUTHORITY` | active | Existing implementation was treated as design authority instead of evidence. | Start from doctrine and contracts; justify inheritance explicitly. |
| `UI/MOBILE/DESKTOP_REPURPOSED` | active | Mobile UX was produced by shrinking or rearranging desktop concepts. | Design mobile interaction first; test actual viewport, reach, occlusion and task flow. |
| `UI/MOBILE/CONTROL_OBSCURED_BY_CHROME` | active | Tools or labels become hidden behind navigation, overlays or other controls. | Safe-area/occlusion tests; contextual chrome must yield to the active task. |
| `MAP/DRAWING/EPHEMERAL_GEOMETRY` | active | Measurements or geometry disappear, cannot be edited, or cannot be recovered. | Accepted geometry is persistent, selectable, editable, undoable and versioned. |
| `ARCH/FEATURE_ISLAND` | active | A component/page works independently without event, relationship or provenance integration. | Every material feature declares relationships, events, inputs, outputs and ripple behavior. |
| `ARCH/HARDWIRED_PROVIDER` | active | Vendor/library choice becomes inseparable from domain logic. | Use an adapter contract and replacement conformance tests. |

## Shadow lifecycle

`candidate → active → mitigated → retired`

New evidence should attach to an existing matching key rather than create a duplicate family.
