---
doc: ontology
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [knowledge-graph, glossary]
---

# Ontology

> **Purpose.** The type system of the business world as MarginGraph models it: entities,
> relationships, attributes, and the rules for changing them.
>
> **Rule.** The ontology is a public contract. Adding is cheap; renaming and removing are
> expensive forever. Every change is an [ADR](../decisions/).

## 1. Design philosophy

How rich the model should be. Modelling too much too early is the classic failure; modelling
too little makes the graph a table. State where we sit and why.

_TBD_

## 2. Core entity types

Start with the smallest set that supports the wedge. Everything else waits.

| Type | Definition | Identity rule | Required attributes |
|---|---|---|---|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## 3. Relationship types

Direction, cardinality, and whether the relation is time-bound.

| Relation | From → To | Cardinality | Time-bound | Notes |
|---|---|---|---|---|
| _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## 4. Attributes and value types

Units, currencies, precision, enumerations, controlled vocabularies. Money and dates cause
most data bugs — specify them once, here.

_TBD_

## 5. External identifiers

Which registry identifiers we map to, and which one is authoritative per jurisdiction.
Mapping to external IDs is a durable asset in itself.

_TBD_

## 6. Alignment with existing standards

Where we reuse rather than invent, and where deviation is justified.

| Standard | Used for | Deviation |
|---|---|---|
| _TBD_ | _TBD_ | _TBD_ |

## 7. Extension model

How new types are proposed, how domain-specific extensions live alongside the core, and how
customer-specific concepts are supported without polluting the core.

_TBD_

## 8. Versioning and deprecation

Version scheme, compatibility guarantees, deprecation window, migration duties toward
[API](../04-platform/api.md) consumers.

_TBD_

## 9. Governance

Who owns the ontology, who can approve a change, and how disputes are resolved.

_TBD_

## Open questions

- [ ] Which entity type is the centre of gravity, and does everything else hang off it?
- [ ] Do we model events as first-class entities?
- [ ] How do we represent an entity we know exists but cannot yet identify?
