---
name: spec-feature
description: Create a feature specification package for the next roadmap phase.
---

# Feature specification workflow

Use this skill when the user wants to define the next feature without
repeating the full specification prompt.

## Required workflow

1. Inspect `specs/roadmap.md`, `specs/mission.md`, and
   `specs/tech-stack.md`.
2. Inspect the existing directories under `specs/` to determine which roadmap
   work is already specified. Identify the next phase or the next coherent
   feature slice that is not yet specified. Do not choose a later phase while
   an earlier phase still has unfinished specification work.
3. Propose a kebab-case feature slug and a directory name in the form
   `<number>-<feature-name>` under `specs/`. Use the next available numeric
   prefix for the selected feature. If an existing directory already covers
   the proposed work, reuse it rather than creating a duplicate.
4. Create a git branch before collecting feature details. Use the branch name
   `spec/<number>-<feature-name>`. Check the current branch and working tree
   first; do not discard or overwrite existing user changes. If branch
   creation would be unsafe or ambiguous, ask the user before proceeding.
5. Before creating or modifying any feature-specification file, use the
   `AskUserQuestion` tool in exactly three grouped rounds:
   - **Scope and outcome:** target users, problem, desired outcome, in-scope
     behavior, and explicit non-goals.
   - **Product and technical decisions:** user flow, business rules, states,
     permissions, integrations, data, accessibility, security, and unresolved
     choices.
   - **Validation and delivery:** acceptance criteria, failure and edge cases,
     test coverage, operational checks, and merge readiness.
6. Summarize the answers and resolve contradictions or material ambiguity with
   the user before writing files. Do not silently invent business decisions.
7. Create the selected directory and exactly these files:
   - `plan.md`: numbered task groups in implementation order. Each group must
     state its objective, affected surfaces, dependencies, and completion
     checks.
   - `requirements.md`: scope, users, context, decisions, assumptions,
     business rules, states, permissions, data needs, integrations,
     accessibility and security requirements, non-goals, and open decisions.
   - `validation.md`: acceptance criteria, unit/integration/accessibility/
     security checks as applicable, failure and edge-case scenarios, manual
     verification steps, and the conditions required before merging.
8. Keep the documents consistent with `specs/mission.md`,
   `specs/tech-stack.md`, and the delivery rule in `specs/roadmap.md`.
   Prefer a small vertical slice with explicit states and recoverable failure
   behavior over a broad screen-only mock.
9. Review the generated documents for missing decisions, contradictory
   requirements, vague validation, and scope that belongs to a different
   roadmap phase. Report the branch name and files created when finished.

## Question-round requirements

Each `AskUserQuestion` round must group related questions rather than asking
one question at a time. Ask all three rounds before writing any of the
feature's `plan.md`, `requirements.md`, or `validation.md` files. It is
acceptable to ask a short follow-up after the three rounds only when an answer
is contradictory or blocks a safe specification.

## File-writing guardrails

- Never create the feature directory or its specification files before the
  three grouped question rounds are complete.
- Do not modify `specs/roadmap.md`, `specs/mission.md`, or
  `specs/tech-stack.md` unless the user explicitly asks for that.
- Preserve unrelated working-tree changes.
- Do not claim implementation is complete; this skill creates the
  specification package only.
