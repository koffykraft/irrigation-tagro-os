# Engineering Service Contract v1

The conversational adviser may request these deterministic operations but may not duplicate their formulae.

## assess-run

Input: role, nominalMm, lengthM, flowLph, system, fallAlongM and any system-specific required head input.

Output states: `pass`, `fail`, `unknown`, `no_load`.

## compare-sizes

Returns an assessment for each explicitly nominated size. It does not choose a product or declare that a size should be purchased.

## sections

Calculates the minimum simultaneous operating section count from known total demand and known available flow. An excessive count returns `escalate` rather than pretending that further sectioning is automatically a good design.

## runtime

Calculates runtime only from a known required volume and known application flow.

## conformance

The 13 issued-estimate checks are a deployment gate for the fitted historical constants.

## UI rule

A missing engineering service or missing input is displayed as unknown/unavailable. A page must not infer PASS merely because no failure is shown.
