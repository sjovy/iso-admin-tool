# Question Frameworks

Question banks and sequencing patterns for each interview type.

---

## Kickoff Interview Questions

### Opening (Why)

Start here. Don't skip to "what" until "why" is clear.

```
- Why is this project needed? What problem does it solve?
- Why now? What triggered this?
- Why not [obvious alternative]? What's wrong with existing solutions?
```

### Vision & Goals

```
- What does success look like in 6 months? 1 year?
- If this project succeeds wildly, what changed?
- What's the minimum viable version?
- What would make this a failure even if "complete"?
```

### Users & Context

```
- Who are the primary users?
- What are they doing today without this?
- What pain are they experiencing?
- What's their technical sophistication?
- Are there secondary users we should consider?
```

### Scope & Constraints

```
- What's explicitly OUT of scope?
- What are the hard technical constraints?
- What can't change? (existing systems, APIs, data formats)
- Any regulatory or compliance requirements?
```

### Angle Selection

After initial context, choose angle to go deep:

```
- The problem you described seems to centre on [X]. Should we start there?
- I see two main angles: [data model] or [user journey]. Which matters more?
- Let's exhaust [chosen angle] before moving on. Agreed?
```

### Feature Discovery

Once angle is chosen, drill deep:

```
- Walk me through a complete user scenario.
- What happens when [edge case]?
- What if [failure scenario]?
- What data needs to persist?
- What actions trigger what state changes?
- Where does this integrate with external systems?
```

### Sprint Boundaries

After features emerge:

```
- What would be a shippable first milestone?
- What features depend on what?
- What's foundational vs. additive?
- If we could only ship half, which half?
```

---

## Sprint-Discovery Questions

### Context Check

```
- This sprint covers [REQ codes]. Is that still accurate?
- Any changes since we scoped this sprint?
- Any new constraints I should know about?
```

### Edge Cases

```
- For REQ-XXX, what happens when [boundary condition]?
- What if user does [unexpected action]?
- What's the error state? How do we recover?
- What's the maximum/minimum [relevant quantity]?
```

### Acceptance Criteria

```
- How will we know REQ-XXX is done?
- What's the test scenario that proves it works?
- Any specific UX requirements?
```

### Simplification

```
- Can we simplify REQ-XXX for this sprint and enhance later?
- Is [feature Y] truly needed now or can it wait?
- What's the 80/20 here?
```

---

## Plan-Review Questions

### Alignment Check

```
- Does this breakdown match how you think about the work?
- Any task groupings that feel wrong?
- Does the sequence make sense?
```

### Coverage

```
- I notice REQ-XXX isn't explicitly in any task. Intentional?
- Anything missing that should be here?
```

### Trade-offs

```
- Planner chose [approach A] over [approach B]. Thoughts?
- This plan optimises for [X]. Is that right?
```

### Approval

```
- Ready to proceed, or should we revise?
- If revising, what specifically should change?
```

---

## Clarify Questions

### Framing

```
- We've hit [specific issue] that blocks progress.
- The requirement says [X], but [Y] is happening.
- I see multiple valid approaches and need direction.
```

### Options Presentation

```
- Option A: [description] — trade-off: [trade-off]
- Option B: [description] — trade-off: [trade-off]
- Which aligns with your intent?
```

---

## Question Sequencing Patterns

### Funnel Pattern

Broad → Narrow → Specific

```
1. "What problem does this solve?" (broad)
2. "Who experiences this most?" (narrower)
3. "Walk me through their workflow" (specific)
4. "What happens at step 3 when X fails?" (very specific)
```

### Thread-Exhaust Pattern

Follow one thread to completion before branching:

```
1. Identify primary thread
2. Keep asking "and then?" or "what if?"
3. Only branch when thread is exhausted
4. Return to capture missed threads
```

### Validate-Deepen Pattern

```
1. "So the core issue is [X]?"
2. [Confirmation]
3. "Let's go deeper on [X]. What about [specific aspect]?"
4. Repeat until exhausted
```

---

## Anti-Patterns to Avoid

- **Too broad:** "Tell me about the project." → Better: "What problem triggered this?"
- **Too many at once:** list of 5 questions → Better: one question, then sequence
- **Leading:** "You want to use React, right?" → Better: "What's driving your frontend choice?"
- **Skipping why:** jumping to features before understanding purpose
- **Abandoning threads:** moving on when an answer is unclear
