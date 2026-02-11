# Changelog Draft

## Theme: Validation consistency
- Added shared content eligibility helper utilities in `src/lib/contentValidation.ts`.
- Replaced duplicated validation logic in `ContentInput` and `GenerateButton` with shared helper usage.
- Consolidated minimum-word threshold into `MIN_CONTENT_WORDS` constant for consistency.

## Theme: Regression safety
- Added unit tests for content validation helper behavior.
- Added interaction tests for Generate button enablement/disablement in pasted-content and URL modes.

## Why this changed
- To remove duplicated business logic around generation eligibility and prevent future drift.
- To establish baseline frontend automated coverage where previously no tests existed.
