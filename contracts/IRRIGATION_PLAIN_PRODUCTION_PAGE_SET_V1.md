# TAGRO Irrigation — Plain Production Page Set v1

Status: WORKING PRODUCTION CONTRACT
Branch: `iteration-06-plain-production`
Purpose: define the smallest complete page set, its commands, subsurfaces, data relationships, persistence rules, and acceptance requirements before further presentation work.

## 1. Production principle

The production interface must behave as a work instrument, not a presentation site.

Permanent pages:

1. Information
2. Field
3. Drawing
4. Adviser
5. Design
6. Materials

The same irrigation job exists behind all six pages. No page owns a separate copy of the customer, plot, geometry, design or materials state.

The permanent shell is intentionally small:

`TAGRO IRRIGATION | Information | Field | Drawing | Adviser | Design | Materials | Save state`

Each page then exposes only the commands relevant to that page. Advanced or low-frequency functions are grouped under compact expandable menus rather than permanently occupying work space.

Desktop and mobile may compose controls differently, but they operate on the same job and the same commands.

---

# 2. INFORMATION

## Purpose
Capture what is known before, during or after field work. Nothing becomes mandatory merely because a field exists. Unknown information remains unknown.

## Main commands
- Save
- Add plot
- Measure on map
- Customer / site
- Water
- More details

## A. Job / customer
- Job reference
- Customer name
- Phone
- Address / locality
- District / state
- Site name
- Notes

### Behaviour
- Search/select existing customer where available.
- New customer can be entered without leaving the job.
- Customer data belongs to the job reference; it is not duplicated by Field or Materials.

## B. Purpose / requirement
- User type
- Requirement: new design / improve existing / extension / repair / estimate / quotation / information only
- Main objective(s)
- Budget information if voluntarily supplied
- Time / labour / automation preference if relevant

### Behaviour
These are context, not engineering truth. They may affect Adviser suggestions and commercial comparisons but cannot override deterministic engineering checks.

## C. Plots and crops
Each plot/section record has a stable information ID such as `INFO-P1`.

### Common fields
- Plot / section name
- Crop
- Crop role
- Crop age / establishment
- Approx. length (m)
- Approx. width (m)
- Approx. area (m²)
- Actual plants
- Row spacing (m)
- Plant spacing (m)
- Irrigation method

### More plot details
- Actual rows
- Existing irrigation
- Emitter / sprinkler model
- Emitter / sprinkler discharge (LPH)
- Emitters / sprinklers per plant where relevant
- Crop water need (mm/day), only if known
- Irrigation interval (days), only if relevant
- Plot notes

### Measurement rules
- If length and width are known for a rectangular estimate, area is derived automatically.
- If dimensions are unknown or geometry is irregular, `Measure on map` opens the same job in Field with Ruler available.
- Manual area remains possible when side lengths are not known.
- A mapped boundary is not silently assigned to an Information plot. The relationship must be explicitly accepted when multiple plots exist.

## D. Water and pump
### Common fields
- Water source type
- Water source description / name
- Existing pump available: yes / no / unknown
- Pump power if known
- Water source to field distance (m)

### More water details
- Pump make / model
- Phase / electrical supply
- Available head if known
- Measured source yield if known
- Storage / tank
- Existing filter
- Existing fertigation / dosing
- Source notes

## E. Site conditions
Collapsed by default.

- Soil
- Slope
- Wind exposure
- Access / gates / paths / machinery movement
- High / low point information
- Existing irrigation / site constraints

## F. Information relationships
Information supplies context to:
- Field: crop, plot names, water source, site references
- Adviser: farmer requirement, known facts, unknowns and preferences
- Design: crop / plant / water inputs where engineering requires them
- Materials: accepted product intent and commercial identity

Information never manufactures geometry, hydraulic PASS/FAIL or product suitability on its own.

---

# 3. FIELD

## Purpose
Record and edit real spatial truth on a map. Field is the primary geometry capture surface.

## Permanent common tools
- Select
- Boundary
- Plot
- Section
- Crop area
- Path
- High point
- Low point
- Water source
- Pump
- Tank
- Main
- Submain
- Lateral
- Plant
- Emitter / sprinkler point
- Measure
- Search / coordinates
- Locate / GPS
- More

## Selection and manipulation
### Single selection
- Move
- Edit shape / vertices
- Resize where geometry supports it
- Rotate
- Duplicate
- Delete
- Details
- Connect / disconnect
- Label / rename

### Multi-selection
- Ctrl/Shift + click: add/remove object
- Same type selection
- Move group
- Rotate group
- Duplicate group
- Delete group
- Group details where common properties apply
- Clear selection

### Keyboard desktop
- Delete: delete selected
- Ctrl/Cmd + D: duplicate selected
- G: move
- E: edit shape
- R: rotate
- Arrow keys: nudge
- Shift + Arrow: larger nudge
- Tool shortcuts may remain discoverable alongside menu commands

## A. Boundary
- Draw polygon
- Edit vertices
- Move
- Rotate
- Duplicate
- Area measurement
- Name / details
- Delete

## B. Plot / section / crop area
- Draw inside or independently of boundary
- Name and identify crop/section
- Link explicitly to Information plot when appropriate
- Area / dimensions derived from geometry
- May become operating/design grouping reference

## C. Site objects
- Water source
- Pump
- Tank
- Path / access
- High point
- Low point
- Plant points
- Crop area

These are evidence objects. Their presence may affect design but does not automatically determine the design.

## D. Pipe network
### Main
- Draw / edit / move / rotate / duplicate / delete
- Connect to source/pump/tank where known
- Connect submains
- Store material / diameter / pressure class once selected
- Real length from coordinates

### Submain
- Draw / edit / move / rotate / duplicate / delete
- Connect to main
- Layout laterals
- Real length from coordinates
- Store material / diameter once selected

### Lateral
- Draw / edit / move / rotate / duplicate / delete
- Connect to submain/main where valid
- Emitter/sprinkler assignment
- Real length from coordinates
- Spacing information

## E. Layout Laterals
Available from a selected Submain.

Inputs:
- spacing along submain
- start offset
- end offset / usable run
- lateral length
- direction / side
- bearing / orientation where required
- clipping boundary / plot
- skip existing feed points

Behaviour:
- Preview first
- Preview geometry is not accepted design
- Create converts preview to ordinary canonical editable laterals
- Generated laterals remain movable/editable/deletable individually or as a group

## F. Measurement
- Point-to-point distance
- object length
- boundary / plot area
- selected-family spacing where meaningful
- measurements visible without requiring another report page

## G. FIELD relationships
Field geometry is canonical spatial truth shared with Drawing.

Field supplies:
- Information: measured geometry where explicitly linked
- Adviser: real objects, relationships, lengths and marked constraints
- Design: actual pipe lengths, network topology, zones/sections and evidence
- Materials: accepted measured quantities

---

# 4. DRAWING

## Purpose
Show and edit the same canonical Field objects as a clean engineering projection without creating a second geometry truth.

## Main commands
- Select
- Fit
- Move
- Edit shape
- Rotate
- Duplicate
- Delete
- Connect
- Details
- Main
- Submain
- Lateral
- Plant / device point
- Measure
- Layout Laterals

## Behaviour
- Same IDs as Field: e.g. `B1`, `M1`, `S1`, `L1`.
- Field edit appears in Drawing.
- Drawing edit appears in Field.
- No screenshot/export copy is treated as editable design.
- Selection and multi-selection semantics mirror Field.
- Measurements use real coordinates, not arbitrary SVG pixel scale.

## Drawing-only conveniences
- Fit design to canvas
- cleaner engineering line view
- vertex manipulation without satellite imagery
- labels / IDs
- optional layer visibility

## Relationships
Drawing is a projection of Field geometry, not an independent design database.

---

# 5. ADVISER

## Purpose
Conversational assistance based on the current job. Adviser interprets, compares and proposes. It does not silently mutate accepted geometry, engineering facts or materials.

## Main commands
- Ask / send
- Use current job context
- Preview proposal
- Accept proposal
- Reject proposal
- Clear proposal
- Product question
- Design question

## Adviser context
May read:
- Information facts and unknowns
- Field / Drawing canonical objects
- network relationships
- real lengths
- deterministic engineering results
- Jain manufacturer-backed product facts
- job-local accepted/rejected preferences

## Adviser outputs
- plain-language answer
- what it understands
- one consequential next question where needed
- options / comparisons
- proposal intent
- assumptions / unknowns
- consequences
- source references

## Geometry proposal rules
- AI does not directly create final map coordinates.
- AI proposes intent such as `generate_laterals`.
- deterministic spatial adapter creates preview geometry from accepted anchors/targets.
- preview is visually separate.
- user accepts before canonical objects are created.

## Learning
- accepted / rejected / modified proposal may be remembered for the same job
- preferences do not become engineering rules
- no uncontrolled global generalisation

## Relationships
Adviser reads from all pages but writes only:
- conversation state
- proposal state
- job-local preference/decision evidence
- accepted proposal only through explicit acceptance path

---

# 6. DESIGN

## Purpose
Convert accepted information and geometry into engineering results, checks and unresolved questions.

The page should function primarily as results + controls, not explanatory prose.

## Main command groups
- Summary
- Water requirement
- Emitters / sprinklers
- Laterals
- Submains
- Main
- Pressure / head
- Operating sections
- Permissible lengths
- Checks / warnings
- Compare
- History

## A. Summary
- field / plot reference
- crop / plant information used
- source / pump information used
- network counts
- measured lengths
- operating sections
- current status: preliminary / checked / accepted
- unresolved engineering inputs

## B. Water requirement
- plants / area basis
- emitter/sprinkler count
- discharge
- operating duration
- irrigation interval
- design flow
- optional crop-water calculation when source data exists

## C. Emitter / sprinkler
- selected method
- product / generic requirement
- discharge
- operating pressure
- spacing
- filtration requirement
- number per plant / area where relevant

## D. Laterals
- each lateral or family
- actual length
- diameter / material
- discharge / emitter count
- permissible length check
- pressure/friction result
- PASS / attention / unresolved

## E. Submains
- actual length
- connected lateral demand
- design flow
- diameter / material
- pressure/friction result
- permissible limits

## F. Main
- actual length
- downstream flow
- diameter / material / class
- pressure/friction result
- source-to-field consequences

## G. Pressure / head
- source head
- pump head where known
- elevation evidence
- friction losses
- required operating pressure
- unresolved elevation/head information called out rather than invented

## H. Operating sections
- all plots / one plot / selected plots
- zone grouping
- section flow
- simultaneous demand
- valve/control requirement
- operating time

## I. Permissible lengths
- lateral reference tables / deterministic calculations
- submain/main checks where defined
- product/pipe assumptions displayed
- no silent repair of source-table anomalies

## J. Checks / warnings
- deterministic 13/13 conformance status
- hydraulic status
- missing required inputs
- overlength
- insufficient head
- excessive flow
- filtration requirement
- product/application mismatch
- unknowns

## K. Compare
Possible comparison dimensions:
- irrigation method
- emitter/sprinkler family
- pipe size
- operating sections
- staged installation
- capital cost
- manual effort
- operating time
- expansion readiness

Comparison is separate from deterministic truth. A cheaper option is not automatically valid.

## L. History
- design revision
- accepted changes
- superseded choices
- measurement revisions
- proposal acceptance events

## Relationships
Design consumes accepted Information + Field/Drawing + deterministic engine inputs.
Design supplies quantified requirements to Materials.

---

# 7. MATERIALS

## Purpose
Turn the accepted design into practical materials, product, price, stock, estimate, quotation and procurement views.

Default presentation is a dense table, not product cards.

## Main command groups
- BOM
- Products
- Price
- Stock
- Estimate
- Quotation
- Purchase requirement
- Reports
- Export

## A. BOM
Order:
1. Emitter / sprinkler
2. emitter/sprinkler accessories
3. Lateral
4. lateral accessories
5. Submain
6. submain accessories
7. Main
8. main accessories
9. Valves / controls
10. Fertigation / venturi / dosing
11. Filter / filtration
12. Pump / source accessories
13. Labour optional
14. Transportation optional
15. GST
16. Notes

Columns may include:
- category
- role
- item
- generic requirement
- Jain product
- TAGRO alias
- size
- design quantity
- procurement quantity
- unit
- unit price
- amount
- stock
- status
- source / price date

## B. Products
Search / type-to-select.

Sources:
- Jain manufacturer product knowledge
- TAGRO product aliases
- generic alternatives where useful

Product selection must preserve distinction between:
- engineering requirement
- manufacturer product candidate
- accepted commercial item

## C. Price
Commercial price precedence must be explicit.

Planned source order:
1. verified TAGRO/BUSY selling/purchase commercial data when connected
2. verified current Jain trade/dealer price source
3. public Jain shop reference where appropriate
4. unknown / not available

No stale or fallback price may be shown as current without date/source state.

## D. Stock
When BUSY inventory is connected:
- branch / material centre
- current stock
- unit
- inter-branch availability
- reserved / unavailable state if supported

Stock does not alter engineering validity; it affects procurement choice.

## E. Estimate
Table workflow:
`search/select item → quantity → unit → price → tax → amount`

Can be generated from BOM, then edited.

## F. Quotation
- customer/job
- selected material scope
- quantities
- price
- GST
- installation/labour where included
- transport
- validity / terms
- notes
- PDF/export later

## G. Purchase requirement
- shortages from accepted BOM
- current stock comparison
- inter-branch possibility
- supplier/Jain order candidate
- PO preparation later

## H. Reports / filters
Filters:
- all plots
- one plot
- selected plots
- one operating section
- product category
- supplier
- stock status

Possible outputs:
- BOM
- product schedule
- pipe schedule
- emitter schedule
- estimate
- quotation
- purchase requirement
- design-material variance

## I. Product information view
Product images and manufacturer information are secondary references, not the default BOM representation.

When opened:
- controlled image size
- official product name
- product type
- manufacturer description
- discharge
- pressure
- filtration
- construction/service facts
- manufacturer applications
- no AI marketing commentary

---

# 8. CROSS-PAGE RELATIONSHIP MODEL

## Job
One anonymous/local/cloud-capable job ID is the root container.

Job owns/references:
- customer/site information
- plot/crop information
- spatial state
- relationships
- engineering state
- product/commercial selections
- learning/proposal evidence
- revisions

## Information Plot ↔ Spatial Plot
May be linked explicitly.
The system may suggest a match but must not silently assert one.

## Spatial object hierarchy
Typical physical flow:
`Water source → Pump → Treatment/filter/fertigation → Main → Submain → Lateral → Emitter/Sprinkler → Plant/soil`

Relationships are explicit objects/links, not inferred solely from drawing order.

## Field ↔ Drawing
Same canonical GeoJSON/object IDs.
No duplication.

## Field/Information → Design
Design reads accepted evidence and dimensions.
Unknowns remain visible.

## Design → Materials
Only accepted/qualified design requirements become BOM requirements.

## Materials → Commercial
A design requirement may resolve to:
- generic item
- Jain item
- TAGRO alias
- BUSY inventory item

These mappings are retained, not overwritten into one name.

## Adviser
Adviser can read all current evidence and propose changes, but cannot silently modify accepted Information, geometry, engineering or materials.

---

# 9. SAVE / PERSISTENCE

Every page operates on the same job identity.

Minimum production behaviour:
- save locally automatically or explicitly without data loss
- visible save state
- page navigation preserves job
- reload restores job
- Field/Drawing restore same geometry
- accepted proposal state survives reload
- Information survives reload
- Design derived state can be recomputed from evidence
- Materials derived state can be recomputed from accepted design

Future cloud persistence may use anonymous capability-token jobs; no user account is required for the current production path.

---

# 10. DESKTOP COMMAND PRINCIPLES

- Mouse and keyboard both valid.
- Type-to-search wherever lists are large.
- Commands remain stable by page.
- Advanced commands expandable.
- No repeated modal confirmation for ordinary edits.
- Confirmation reserved for consequential save/delete/replace operations where recovery is not obvious.
- Favourites/shortcuts may later allow frequently used commands to be pinned.

---

# 11. MOBILE PRINCIPLES

Mobile is not a squeezed desktop copy.

- same pages and same job
- same underlying commands
- fewer simultaneous controls
- bottom/compact sheets for context actions
- large touch targets
- map/drawing gets maximum area
- no hover-only operations
- close/back always reachable
- browser/mobile gate required before production acceptance

---

# 12. PRODUCTION ACCEPTANCE GATES

## Gate A — Page/runtime
- Information loads
- Field loads map/tiles
- Drawing loads
- Adviser loads
- Design loads
- Materials loads
- navigation through all surfaces produces no JS/page errors

## Gate B — Information
- enter customer/site/crop
- save
- reload
- values survive
- add multiple plots
- area derives correctly when applicable
- Measure on map preserves same job

## Gate C — Field
- draw boundary
- draw main/submain/lateral
- place water/pump/plant/device
- select second object reliably
- edit shape
- move
- rotate
- duplicate
- delete
- multi-select
- same-type select
- connect
- ruler
- reload/persist

## Gate D — Layout
- select submain
- preview laterals
- change spacing/side/length
- create
- created laterals ordinary editable canonical lines
- individual and group manipulation works

## Gate E — Drawing
- same IDs/geometry as Field
- edit object in Drawing
- return Field and confirm change
- persistence after reload

## Gate F — Adviser
- current job context visible to adviser
- proposal does not mutate accepted design
- preview visible
- reject clears without mutation
- accept creates intended canonical change

## Gate G — Design
- measured geometry appears
- deterministic conformance remains 13/13
- no hydraulic PASS/FAIL fabricated from missing inputs
- required unresolved inputs visible

## Gate H — Materials
- BOM derives from accepted design
- quantities visible by role
- product selection does not overwrite engineering requirement
- price/stock source state explicit
- estimate/quotation calculations reproducible

## Gate I — Mobile
Repeat core Information/Field/Drawing/navigation actions at real phone viewport and touch interaction.

---

# 13. PRODUCTION WORK ORDER

1. Freeze tested Iteration 05 checkpoint.
2. Build Iteration 06 from that checkpoint.
3. Keep common six-page navigation plain.
4. Remove duplicate/obsolete navigation paths only after replacement path passes.
5. Make Information concise/progressive.
6. Make Field/Drawing the primary proven spatial work pair.
7. Convert Design to compact engineering result controls/tables.
8. Convert Materials to compact BOM/commercial tables and type-to-search.
9. Keep Adviser subordinate to real job state.
10. Connect verified product/media knowledge.
11. Connect BUSY/TAGRO commercial items/prices/stock when live source is proven.
12. Run desktop and mobile gates.
13. Production deployment only after acceptance.

---

# 14. NON-GOALS

- no decorative redesign for its own sake
- no giant product cards as default work UI
- no AI-written marketing text on operational pages
- no second geometry truth
- no silent assumptions
- no silent product/price substitutions
- no login/account requirement for current job workflow
- no removal of functioning V16-era capabilities merely to simplify appearance

This document is the page-set contract for the plain production build. Changes to page responsibility or canonical relationships should update this contract before implementation diverges.