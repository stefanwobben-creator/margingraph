---
doc: security
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [principles, database, api]
---

# Security

> **Purpose.** Threat model, controls, privacy posture and compliance path. Enterprise and
> regulated buyers evaluate this before they evaluate the product.
>
> **Note.** A business graph inevitably contains information about people — directors,
> owners, signatories. Privacy obligations apply even when the subject is "a company".

## 1. Threat model

| Asset | Threat | Actor | Impact | Control |
|---|---|---|---|---|
| The graph itself | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Customer data & queries | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Credentials & keys | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Ingestion pipeline integrity | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

Note that queries themselves are sensitive: who is researching whom can be more valuable
than the data returned.

## 2. Data classification

Tiers, examples, and the handling rules for each — storage, logging, export, and use in
non-production environments.

_TBD_

## 3. Identity and access

Authentication, authorisation model, tenancy isolation, internal least-privilege, and access
to production data by staff.

_TBD_

## 4. Application and API security

Input validation, injection defence, rate limiting, abuse detection, and defence against
prompt injection arriving through ingested content — see
[Agent Architecture](../03-intelligence/agent-architecture.md).

_TBD_

## 5. Infrastructure security

Network boundaries, secrets management, encryption in transit and at rest, dependency and
supply-chain hygiene, patching.

_TBD_

## 6. Privacy

Lawful basis for processing personal data in the graph, subject rights (access, correction,
erasure) and how they interact with an append-only history, retention, minimisation, and
cross-border transfers.

_TBD_

## 7. Scraping and extraction defence

Our own data is the asset. How we detect and limit bulk extraction without harming legitimate
users or search-engine crawlers.

_TBD_

## 8. Audit and logging

What is logged, immutability, retention, and who can read the logs.

_TBD_

## 9. Compliance path

Which certifications matter to which buyers, in what order, and their real cost.

_TBD_

## 10. Incident response

Severity levels, on-call, containment, customer and regulator notification timelines,
post-mortem practice.

_TBD_

## 11. Business continuity

Failure domains, degradation modes, and what the product still does when a dependency is down.

_TBD_

## Open questions

- [ ] Which certification does the first enterprise deal actually require?
- [ ] How do we honour an erasure request against an append-only assertion log?
- [ ] Are customer queries logged, and is that acceptable to a competitive-intelligence user?
