# TAGRO Irrigation OS — Product Knowledge Contract v0.1

Status: WORKING DESIGN

## 1. Purpose

Products are not merely catalogue rows. The Irrigation OS needs structured product knowledge so a designer can understand why one emitter, pipe, filter, valve or fertigation component may suit a particular field better than another.

This contract begins with Jain Irrigation but must remain manufacturer-neutral.

## 2. Product identity

A product record may include:

- manufacturer
- family
- model / item code
- aliases
- product type
- commercial unit / pack
- source edition
- source document reference
- effective date
- availability state
- price edition
- programme / PDMC mapping where supported

## 3. Engineering characteristics

Where verified from manufacturer evidence, a product may expose characteristics such as:

- nominal discharge / flow range
- operating pressure range
- pressure behaviour
- emitter exponent / hydraulic characteristic
- filtration requirement
- inlet / outlet / connection method
- compatible lateral / pipe size
- spacing recommendations where explicitly supported
- recommended application types
- limitations / exclusions
- temperature / chemical / clogging considerations where explicitly supported

Unknown values remain unknown. They are not inferred merely to make comparison cards complete.

## 4. Evidence classes

Every product characteristic should retain an evidence class:

- `manufacturer_verified`
- `programme_verified`
- `dealer_price_verified`
- `tagro_observed`
- `installed_outcome`
- `ai_inferred`
- `user_supplied`

A display may summarize these, but the underlying provenance remains separate.

## 5. Product comparison

The Adviser may compare candidates by field-relevant consequences, for example:

- pressure tolerance
- suitability for uneven terrain
- filtration burden
- permissible run implications
- wetting/application pattern
- compatibility with existing lateral
- initial cost
- pack/procurement consequence
- maintenance or clogging considerations
- future availability / replaceability

A generic option may be included even when a Jain product is the reference candidate.

## 6. Product resolution

The BOM should first identify the engineering requirement, then resolve candidate products.

Example:

`Requirement: emitter, approx. 8 LPH, 4 per coconut plant, pressure behaviour suitable for proposed operating range`

may resolve to:

- Jain candidate A
- Jain candidate B
- generic equivalent
- unresolved if evidence is insufficient

This prevents the drawing from becoming hardwired to one manufacturer SKU.

## 7. Learning boundary

TAGRO may accumulate installed and service evidence about products. Learned experience can improve ranking and explanation, but must remain distinguishable from manufacturer specification.

Example:

`TAGRO observed easier field replacement` is not equivalent to `manufacturer-rated pressure range`.

## 8. Governing sentence

**Resolve irrigation requirements into products using verified characteristics, provenance, field consequences and commercial context; teach the difference between options without making a catalogue choice masquerade as engineering truth.**
