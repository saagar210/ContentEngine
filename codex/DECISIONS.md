# Decision Log

## 2026-02-10
1. **Limit scope to frontend validation consistency + tests.**
   - Rationale: discovered duplicated content eligibility logic in `ContentInput` and `GenerateButton`, with no automated tests to protect behavior.
   - Alternative rejected: broader refactor of generation flow/hooks because it would increase risk and violate small, reversible delta principle.

2. **Treat Rust test failure as environmental, not code failure.**
   - Evidence: `cargo test` fails during `glib-sys` build due to missing `glib-2.0` system package.
   - Alternative rejected: modifying Rust dependencies/build scripts to bypass platform requirements in this session.

## 2026-02-10 (Implementation)
3. **Expose validation threshold via constant (`MIN_CONTENT_WORDS`) instead of repeating literal `50`.**
   - Rationale: avoids hidden drift and makes future policy updates trivial.
   - Alternative rejected: leaving literals in-place and only adding tests.

4. **Add component-level test for button state using Zustand state setup + mocked `useRepurpose`.**
   - Rationale: verifies the concrete user-facing guardrail where generation is initiated.
   - Alternative rejected: helper-only tests (insufficient for UI integration confidence).
