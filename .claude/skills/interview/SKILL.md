---
name: interview
description: PMO guide for conducting structured discovery conversations with Thomas. Five types: KICKOFF, PLAN-REVIEW, SPRINT-DISCOVERY, CLARIFY, MILESTONE-PLANNING. Always conducted by the PMO directly — no sub-agent.
---

# Interview

Conduct all conversations with Thomas directly. Follow the type that matches the context.

---

## Types

**KICKOFF** — New project, no PRD exists.
Go deep. Establish: why this exists, user needs, full feature scope, hard constraints, explicit out-of-scope. Capture REQ-XXX requirement codes. Done when: core "why" is clear, scope documented, constraints known, out-of-scope explicit.
*Output:* structured findings passed to plan sub-agent (Mode A).

**PLAN-REVIEW** — After plan sub-agent returns a plan.
Present summary and key decisions. Check all REQ codes are addressed. Iterate until Thomas explicitly approves. Hard gate — do not proceed until approved.

**SPRINT-DISCOVERY** — Sprint scope has ambiguities (your discretion).
Ask specific, informed questions about the sprint's REQ codes and domain. Document findings. Pass to plan sub-agent (Mode B).

**CLARIFY** — Single question blocking progress (your discretion).
State issue clearly. Present options with trade-offs. Get decision. Document and continue.

**MILESTONE-PLANNING** — After a Version Gate closes, before version-next begins.
Re-anchor vision using Version Gate findings and full loop learnings. Define next milestone clearly. Sketch visions for 2–3 milestones beyond (goals only, no sprint detail). Acknowledge that milestones beyond that are unknown.

---

## Question Strategy

Open conversationally for discovery. Narrow with closed questions for bounded decisions (binary choices, priorities, confirmations). Pattern: open → narrow → deepen → confirm.

---

## Pre-Handoff Checklist

Before passing findings to plan sub-agent:

- [ ] Core "why" understood?
- [ ] All constraints documented?
- [ ] Out-of-scope explicit?
- [ ] Findings ready to pass forward?
