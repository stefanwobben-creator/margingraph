---
doc: agent-architecture
status: stub
owner: TBD
last-reviewed: TBD
depends-on: [llm-architecture, ai-strategy, knowledge-graph]
---

# Agent Architecture

> **Purpose.** The autonomous and semi-autonomous workers that build and maintain the graph,
> and the ones that serve users. What they may do, what they may never do, and how we know
> what they did.
>
> **Rule.** An agent that can write to the graph is a production system with permissions,
> limits, audit and rollback — not a script with a prompt.

## 1. Agent taxonomy

| Agent | Purpose | Writes to graph | Autonomy level | Escalates to |
|---|---|---|---|---|
| Discovery | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Extraction | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Resolution | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Verification | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Monitoring / change detection | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| User-facing research | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## 2. Autonomy levels

Define the ladder explicitly — from suggest-only to write-with-review to write-freely —
and the accuracy evidence required to move an agent up a rung.

_TBD_

## 3. Orchestration

Scheduling, queues, fan-out, retries, backpressure, idempotency. Which parts are
deterministic pipeline and which are model-directed. Prefer deterministic control flow;
use model judgement only where it is genuinely needed.

_TBD_

## 4. Tools

The tool surface available to agents, each with its own permission scope. Tools that write
are separated from tools that read.

_TBD_

## 5. State and memory

What an agent carries between steps and runs, where it is stored, and how it expires.

_TBD_

## 6. Permissions and blast radius

Per-agent limits: rate, volume, entity scope, and the maximum damage a malfunctioning agent
can do before it is stopped.

_TBD_

## 7. Human escalation

Triggers, the review queue, reviewer interface, turnaround expectations, and how decisions
feed back as training data.

_TBD_

## 8. Observability and audit

Every graph mutation traces to an agent, a run, a version and an input. Replay and rollback
procedure. This is also how [Security](../04-platform/security.md) audits the pipeline.

_TBD_

## 9. Failure modes

Loops, runaway cost, cascading bad writes, injected instructions from ingested content,
and the kill switch for each.

_TBD_

## Open questions

- [ ] What is the maximum number of assertions an agent may write unreviewed?
- [ ] Can an agent create a new entity, or only enrich existing ones?
- [ ] How do we detect a slowly degrading agent before users do?
