---
name: test-case-design-checklist
description: Designs test cases and test plans for any project by listing information sources, performing mandatory cross-source reconciliation (conflicts and ambiguities escalated to humans), writing requirements analysis that records those decisions, then building a coverage checklist, test points, cases, and back-check. Use whenever the user asks to design test cases, testing scenarios, test plans, test strategy, or case coverage.
---
# Test Case Design Checklist

## Required workflow

Always follow this order when designing test cases or test plans:

1. List the **information sources** you are using.
2. Perform **cross-source reconciliation** (read, compare, flag conflicts and ambiguities; escalate to the human engineer before locking baseline).
3. Write **requirements analysis** based on reconciled sources, including a **source reconciliation log** in the deliverable.
4. Apply the **scope filter** before building the checklist.
5. Build a **coverage checklist** before writing any case.
6. Group the checklist into clear test dimensions.
7. For each dimension, list short, concrete test points.
8. Decompose test points into specific cases, applying the **three-quality standard**.
9. After drafting cases, do a **back-check against the checklist**.
10. If any checklist item is not covered, explicitly add a gap note or add cases.
11. If any rule was updated during design, do a **consistency scan** across all sections.

Never skip step 1, step 2, step 3, step 9, or step 11.

### When to read sources in depth

Deep reading and thinking **starts as soon as sources are identified** (step 1) and **continues through cross-source reconciliation** (step 2). Requirements analysis (step 3) must **not** treat conflicting sources as settled fact until step 2 is done or explicitly marked as human-pending.

**Priority rule:** Before writing normative requirements or cases, **always cross-check sources first** — not after cases are drafted.

## Step 1: List information sources

Start every test design task by listing the source basis you are using.

Typical source types:
- Business requirements or product docs
- Architecture or interaction docs
- Protocol or exchange specs
- API docs
- Existing cases or regression suites
- Code behavior or logs
- User clarifications in the current conversation

If information is missing or conflicting:
- Say what is missing
- Separate confirmed facts from assumptions
- Ask the user before turning assumptions into cases

### Source version filtering (mandatory)

When multiple documents describe the same topic (same or similar title/path), you MUST perform version filtering before reconciliation:

1. Prefer sources explicitly marked as `CURRENT`, `LATEST`, `正式版`, `生效版`, or with the newest approved revision date.
2. Treat sources marked as `HISTORICAL`, `历史`, `归档`, `deprecated`, `superseded`, `obsolete` as non-baseline references.
3. If both current and historical versions exist for the same topic:
   - Use only the current version as normative baseline for requirements and test cases.
   - Historical versions may be cited only in a short "background/diff" note and MUST NOT define expected results.
4. In the Information Sources section, tag each source with one of:
   - `BASELINE-CURRENT`
   - `REFERENCE-HISTORICAL`
   - `PENDING-CONFIRMATION`
5. If two candidate "current" sources conflict and no precedence rule is given, escalate to human and mark `PENDING HUMAN` before drafting normative cases.

## Step 2: Cross-source reconciliation (mandatory)

This step is **high priority**. It runs immediately after listing sources and **before** requirements analysis is treated as authoritative.

**Goal:** Compare all listed sources on dimensions that affect tests (timelines, terminology, ownership of behavior, phase names, APIs, version dates). Identify:

- **Direct conflicts** — source A and source B assert different facts.
- **Ambiguity** — wording is vague, undefined terms, or unclear scope.
- **Silent mismatch** — same word used with different meanings (e.g. different timezones, different "maintenance window" boundaries).

**Process:**

1. For each high-risk topic (schedules, state machines, error semantics, version skew), extract what **each** source says in one line.
2. Build a reconciliation table or bullet list:

   | Topic | Source A | Source B | Issue type (conflict / ambiguous / term drift) | Proposed action |
   | ----- | -------- | -------- | --------------------------------------------- | ---------------- |
   | ...   | ...      | ...      | ...                                           | Ask human / use primary source X / mark ASSUMPTION |

3. **Escalate to the human engineer** for every conflict or ambiguity that would change cases or acceptance criteria. Do not silently pick a winner without human confirmation unless the user has already stated a precedence rule in the conversation.
4. For items still open after escalation, label them clearly: `PENDING HUMAN`, `ASSUMPTION (until confirmed)`, or `OUT OF SCOPE`.
5. If a conflict is between current vs historical documents on the same topic, resolve by default to current and record: `Historical ignored for baseline`.

**Deliverable:** The reconciliation output is **copied into the final document** as **Source reconciliation** (or equivalent section) and summarized again inside **Requirements analysis** as the **adopted baseline** (what this document assumes going forward).

## Step 3: Requirements analysis

After cross-source reconciliation, summarize the requirements in a few flat bullets.

The summary should capture:
- What is being tested
- System responsibility boundaries
- Key state changes or business outcomes
- Important exclusions or non-goals
- **Adopted baseline** — which sources were chosen where conflicts existed, and what the human confirmed
- Any assumptions that still need confirmation (must align with the reconciliation table)

Do not jump directly from raw source material to test cases.

**Documentation rule:** The written requirements analysis must make the **cross-source reconciliation result** visible to reviewers (not only in chat). Same for the test design doc: case preconditions and expected results must be consistent with the **documented** baseline, not an unstated pick among sources.

## Step 4: Scope filter — what NOT to include

Before building the coverage checklist, filter out the following. They do NOT belong in new requirement cases:

- **Inherent existing behavior**: behaviors that existed before this change and are not affected by it. Put them in the regression suite, not here.
- **External system boundaries**: if a boundary (such as a session state transition time) is owned and enforced by an external system (exchange, upstream), do not write cases to verify the external system switches correctly. Write cases to verify how your system behaves within each state.
- **Regression management**: a regression set or smoke pack is a separate artifact managed in the automation suite. Do not embed it in new requirement cases.

Only include cases where:
- The behavior is **newly introduced** by this requirement, OR
- The behavior of an existing component **changes** because of this requirement

## Step 5: Build the coverage checklist

After applying the scope filter, build a flat checklist of coverage dimensions.

Common dimensions to inspect:
- Functional actions
- Roles or customer types
- State transitions
- Time windows or schedules
- Upstream and downstream message flow
- Success paths
- Failure source classification
- Recovery or restart behavior
- Configuration variants
- External dependency behavior
- Audit, logs, or observable evidence

If the design includes multi-hop or layered enforcement (e.g. gateway -> router -> downstream),
you MUST add a "multi-layer failure-mode" checklist subsection that explicitly covers:
- Primary layer catches correctly
- Primary layer misses, secondary layer catches (fallback)
- Primary and secondary disagree (fail-safe behavior)
- Both layers miss (high-risk path: alert + observability + incident closure)

Add domain-specific dimensions when the project requires them.

## Step 6: Group dimensions

Group the checklist into a few readable sections, for example:
- Core flow
- Exceptions and failures
- Time or state boundaries
- Integration and pass-through
- Operations and recovery

## Step 7: List concise test points

For each dimension, write short test points before writing cases.

Good test point examples:
- Request is passed southbound unchanged
- Response is passed northbound unchanged
- No client cancel request exists before exchange-driven cancel
- Failure is classified as exchange reject rather than connection loss

Avoid jumping directly to long case tables before test points exist.

## Step 8: Decompose into concrete cases

Convert test points into executable cases.
Each case should include at least:
- Case ID
- Short case name
- Scenario or trigger
- Preconditions
- Expected result
- Evidence source if important

When useful, split by:
- Customer type
- Time boundary
- Connection state
- Request type
- Environment variant

### Three-quality standard for every case

Apply these three quality checks to each case before finalizing:

**Executable** — a tester can run the case independently without further interpretation:
- Case name must include the specific trigger, phase, or time point (e.g. "Close period / 16:00:05 / Pre-open period"), not just the intent (e.g. "verify maintenance window behavior")
- Preconditions must be checkable system states (e.g. "client and upstream service are disconnected"), not vague descriptions (e.g. "in abnormal state")
- Expected result must be an observable outcome with evidence type noted (e.g. "client receives failure response" or "visible in link log"), not "behaves correctly"

**Regression-ready** — the case can be automated or stably reproduced without human interpretation:
- Each item in expected result must be independently assertable (mappable to one assert statement)
- State dependencies between cases must be explicitly listed in preconditions, not implied by execution order

**Reviewable** — requirements owners and developers can verify coverage by reading the cases:
- Cases must be organized around business dimensions (e.g. by maintenance window time phase for trading systems), not by technical modules
- Each rule stated in the requirements analysis must be traceable to at least one case

### Multi-layer logic vulnerability check (mandatory when applicable)

When a rule is enforced by more than one component, you MUST include compatibility cases
for low-probability chain defects, including clock/state drift and delayed delivery.

At minimum, include these four case types:
- Layer A detects, Layer B consistent
- Layer A misses, Layer B fallback detects
- Layer A and Layer B produce inconsistent decisions
- Both layers miss detection (must assert high-priority alert and forensic logs)

Do not treat these as optional "edge cases". They are mandatory safety cases whenever
layered enforcement exists.

## Step 9: Mandatory back-check

After drafting cases, create a short verification section:
- Checklist item -> covered by which case IDs

## Step 10: Coverage gaps

If any checklist item is not covered:
- Say `Uncovered:` and list it
- Then either add cases or explain why it is intentionally out of scope

## Step 11: Rule change consistency scan

Whenever a rule is updated during design (not just at the end), scan these locations for stale wording before publishing:

1. **Source reconciliation** — do conflicts/ambiguities still match human decisions?
2. **Information sources summary** — confirmed rules listed in the sources section
3. **Requirements analysis** — business rules baseline
4. **Coverage checklist** — checklist item wording
5. **Case names** — do they reflect the current rule?
6. **Expected results** — do they match the current rule?

If any location still uses the old rule, fix it and flag the change explicitly:
> Rule updated: [old rule] → [new rule]

This lets reviewers verify the change was intentional, not accidental.

## Output pattern

Use this structure by default:

```markdown
## Information Sources
- Source A
- Source B

## Source reconciliation (cross-check)
| Topic | Source A | Source B | Issue | Resolution / Owner decision |
| ----- | -------- | -------- | ----- | ---------------------------- |
| ...   | ...      | ...      | conflict / ambiguous | Human confirmed: ... |

## Requirements Analysis
- Adopted baseline (after reconciliation): ...
- Requirement 1
- Boundary 1

## Coverage Checklist
- Item A
- Item B

## Test Point Groups
### Group 1
- Point 1
- Point 2

### Group 2
- Point 3

## Test Cases
| Case ID | Case Name | Preconditions | Expected |
|---------|-----------|---------------|----------|

## Checklist Back-Check
- Item A -> TC-01, TC-02
- Item B -> TC-03
- Uncovered: Item C
```

## Trigger rules

Use this skill for any project when the user asks for:
- test cases
- testing scenarios
- test plan
- test design
- test strategy
- coverage analysis
- supplementing or reviewing test cases
