---
name: tdd
description: Test-driven development with red-green-refactor loop. Use when building features or fixing bugs. Attached to a general-purpose sub-agent by the PMO. Vertical slices only — one test, one implementation, repeat.
---

# Test-Driven Development

## Philosophy

**Core principle:** Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests should not.

Good tests are integration-style: they exercise real code paths through public APIs. They describe *what* the system does, not *how*. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors.

Bad tests are coupled to implementation: they mock internal collaborators, test private methods, or verify through external means. Warning sign: your test breaks when you refactor but behavior hasn't changed.

See `references/tests.md` for examples and `references/mocking.md` for mocking guidelines.

---

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.**

This produces tests that test *imagined* behavior, not *actual* behavior. You outrun your headlights, committing to test structure before understanding the implementation.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  ...
```

---

## Workflow

### 1. Planning

Before writing any code:

- [ ] Confirm with PMO what interface changes are needed
- [ ] Identify behaviors to test (prioritize — you cannot test everything)
- [ ] Identify opportunities for deep modules (see `references/deep-modules.md`)
- [ ] Design interfaces for testability (see `references/interface-design.md`)
- [ ] List behaviors to test — not implementation steps

### 2. Tracer Bullet

Write ONE test confirming ONE thing end-to-end:

```
RED:   Write test for first behavior → fails
GREEN: Write minimal code to pass → passes
```

Proves the path works end-to-end before building out.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:
- One test at a time
- Only enough code to pass the current test
- Do not anticipate future tests
- Keep tests focused on observable behavior

### 4. Refactor

After all tests pass, look for candidates (see `references/refactoring.md`):

- [ ] Extract duplication
- [ ] Deepen modules
- [ ] Apply SOLID principles where natural
- [ ] Run tests after each refactor step

**Never refactor while RED. Get to GREEN first.**

### 5. Playwright Spec

After vitest tests pass and refactor is complete, write or update the Playwright `.spec.ts` file for this feature.

The spec covers the same behavior at the UI level — what a user does, what they observe. It is not a unit test duplicate; it exercises the full stack through the browser.

One spec file per feature. Add new `test()` blocks for each behavior added this cycle. Do not delete existing blocks.

Run `npx playwright test [feature].spec.ts` to confirm the spec passes before marking the behavior complete.

---

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
[ ] Playwright spec written or updated for this behavior
[ ] Playwright spec passes
```
