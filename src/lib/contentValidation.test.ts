import { describe, expect, it } from 'vitest';
import { getWordCount, hasEligibleContent, MIN_CONTENT_WORDS } from './contentValidation';

describe('contentValidation', () => {
  it('counts words using trimmed whitespace boundaries', () => {
    expect(getWordCount('')).toBe(0);
    expect(getWordCount('   ')).toBe(0);
    expect(getWordCount('one two\nthree\tfour')).toBe(4);
  });

  it('requires non-empty URL when URL mode is enabled', () => {
    expect(
      hasEligibleContent({
        useUrl: true,
        sourceUrl: '   ',
        rawContent: 'irrelevant',
      })
    ).toBe(false);

    expect(
      hasEligibleContent({
        useUrl: true,
        sourceUrl: ' https://example.com ',
        rawContent: '',
      })
    ).toBe(true);
  });

  it('requires minimum word count when URL mode is disabled', () => {
    const fortyNineWords = Array.from({ length: MIN_CONTENT_WORDS - 1 }, (_, i) => `w${i}`).join(' ');
    const fiftyWords = Array.from({ length: MIN_CONTENT_WORDS }, (_, i) => `w${i}`).join(' ');

    expect(
      hasEligibleContent({
        useUrl: false,
        sourceUrl: '',
        rawContent: fortyNineWords,
      })
    ).toBe(false);

    expect(
      hasEligibleContent({
        useUrl: false,
        sourceUrl: '',
        rawContent: fiftyWords,
      })
    ).toBe(true);
  });
});
