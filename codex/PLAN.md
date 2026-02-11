# Delta Plan

## A) Executive Summary
### Current state
- Frontend is React + Zustand and renders input/generation workflow from `src/pages/NewContentPage.tsx`.
- Content eligibility logic is duplicated in both `src/components/input/ContentInput.tsx` and `src/components/input/GenerateButton.tsx`.
- Output-format and tone metadata are centralized in `src/lib/constants.ts`, but minimum content threshold is hard-coded in component-level logic.
- API boundary is centralized in `src/lib/tauriApi.ts`.
- Rust backend organizes responsibilities into `commands/`, `services/`, `models/`, and `db/` modules under `src-tauri/src/`.
- SQLite migrations are additive and versioned in `src-tauri/src/db/migrations.rs`.
- Baseline verification: frontend build passes; Rust test command blocked by missing OS library; Vitest has no tests.

### Key risks
- Divergence risk from duplicated validation logic can cause inconsistent UX.
- No automated frontend tests currently protect eligibility behavior.
- Introducing UI behavior changes without tests could regress button enablement semantics.

### Improvement themes (prioritized)
1. Centralize content eligibility rule in one reusable utility.
2. Add frontend tests for validation behavior.
3. Keep change strictly frontend-local and avoid backend contract churn.

## B) Constraints & Invariants (Repo-derived)
- Must keep Tauri command names and request shapes unchanged (`src/lib/tauriApi.ts`).
- Must preserve minimum-content rule behavior (50-word minimum for pasted text, non-empty URL for URL mode), inferred from existing component logic.
- Non-goals: backend schema changes, API contract changes, UI redesign.

## C) Proposed Changes by Theme (Prioritized)
### Theme 1: Validation centralization
- Current approach: duplicated local calculations in `ContentInput` and `GenerateButton`.
- Proposed: introduce shared helper(s) for word count + content eligibility; replace duplicated logic in both components.
- Why: single source of truth, easier review, lower regression risk.
- Tradeoffs: small extra indirection; accepted for consistency.
- Scope boundary: only frontend files in `src/components/input/` and new helper under `src/lib/`.
- Migration approach: additive helper first, then targeted component replacements.

### Theme 2: Test coverage for eligibility behavior
- Current approach: no tests.
- Proposed: add Vitest coverage for helper and GenerateButton enable/disable behavior.
- Why: convert baseline “no tests” into actionable regression safety.
- Tradeoffs: introduces test maintenance overhead.
- Scope boundary: tests under `src/lib/` and/or `src/components/input/`.

## D) File/Module Delta (Exact)
- **ADD**
  - `src/lib/contentValidation.ts` (shared validation logic).
  - `src/lib/contentValidation.test.ts` (unit tests for helper behavior).
  - `src/components/input/GenerateButton.test.tsx` (component behavior coverage).
- **MODIFY**
  - `src/components/input/ContentInput.tsx` (consume helper).
  - `src/components/input/GenerateButton.tsx` (consume helper).
- **REMOVE/DEPRECATE**
  - None.
- Boundary rules
  - Keep helper pure and UI-agnostic.
  - No imports from component layer into helper.

## E) Data Models & API Contracts (Delta)
- Current model/contracts unchanged.
- Proposed changes: none to persisted schema, Tauri commands, or API payloads.
- Compatibility: full backward compatibility.
- Migrations/versioning: not applicable.

## F) Implementation Sequence (Dependency-Explicit)
1. **Create shared validation helper + unit tests**
   - Files: `src/lib/contentValidation.ts`, `src/lib/contentValidation.test.ts`.
   - Preconditions: baseline build available.
   - Verification: `pnpm exec vitest run src/lib/contentValidation.test.ts`.
   - Rollback: remove helper/test files.
2. **Wire helper into input components**
   - Files: `src/components/input/ContentInput.tsx`, `src/components/input/GenerateButton.tsx`.
   - Dependencies: Step 1.
   - Verification: `pnpm build`.
   - Rollback: restore inline component logic.
3. **Add GenerateButton interaction test + run targeted then broader checks**
   - Files: `src/components/input/GenerateButton.test.tsx`.
   - Dependencies: Steps 1–2.
   - Verification: `pnpm exec vitest run src/components/input/GenerateButton.test.tsx` then `pnpm exec vitest run` and `pnpm build`.
   - Rollback: remove test and revert components if unstable.

## G) Error Handling & Edge Cases
- Current pattern: UI computes eligibility and disables button rather than throwing errors.
- Improvement: keep same UX behavior while centralizing criteria.
- Edge cases to cover:
  - Blank content.
  - Exactly 50 words.
  - URL mode with whitespace-only URL.
  - URL mode with trimmed non-empty URL.

## H) Integration & Testing Strategy
- Integration point: `GenerateButton` + `ContentInput` consume shared helper.
- Unit tests: helper function table-based tests.
- Interaction tests: button disabled/enabled transitions via store state.
- Definition of done:
  - shared helper used in both components,
  - tests pass,
  - build passes.

## I) Assumptions & Judgment Calls
- Assumption: existing UX threshold of 50 words is intended and must be preserved.
- Assumption: introducing tests is acceptable despite previous no-test baseline.
- Judgment call: prioritize smallest high-confidence delta over larger architectural changes.
