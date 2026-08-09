# Irrigation Relationship Model v0.1

Irrigation is a domain dock inside TAGRO Farming Systems.

## Core physical chain

`Water source → Pump → Treatment / fertigation → Main → Field connection → Submain → Lateral → Outlet / application device → Plant / soil`

## Demand propagates upstream

Downstream demand determines upstream design.

- application device discharge and spacing influence lateral demand and performance
- lateral count, length, diameter and demand influence submain demand and sizing
- submain count, length, diameter and operating grouping influence main demand and sizing
- main demand, elevation, losses and operating groups influence pump/head/power requirements
- pump and source limitations can force operating-group redesign

## Farm planes consumed by irrigation

At minimum irrigation may consume:

- field / location
- soil
- crop / plant
- weather / season / time
- elevation / slope
- water source and availability
- power
- pump availability
- labour
- access / pathways / gates / structures
- mechanisation
- affordability / investment objective
- household vs commercial water use
- maintenance capability
- fertilizer / fertigation context

## Plant irrigation

For upstream demand aggregation, multiple emitters around one plant may be represented as the common plant discharge point.

For lateral design, individual emitter discharge, emitter spacing/configuration, plant spacing and lateral geometry remain relevant.

## Sprinklers / jets / mini sprinklers

Application devices may include discharge, operating pressure, wetted diameter, spacing, overlap and application-rate behaviour.

Plant irrigation may optionally derive wetted area and applied depth.

Field irrigation must account for coverage, spacing/overlap and total operating flow.

## Human engineering

Filters, valves, fertigation equipment and controls must be located using hydraulic constraints together with access, maintenance, movement, security and labour realities.

## Partial designs are valid

A user may provide only a boundary and continue. Missing information is represented explicitly rather than fabricated.

A design can therefore exist at different maturity states: field-known, water-known, concept-ready, hydraulic-ready, installation-ready, installed, revised.
