export const MIN_CONTENT_WORDS = 50;

export function getWordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function hasEligibleContent(params: {
  useUrl: boolean;
  sourceUrl: string;
  rawContent: string;
  minWords?: number;
}): boolean {
  const { useUrl, sourceUrl, rawContent, minWords = MIN_CONTENT_WORDS } = params;

  if (useUrl) {
    return sourceUrl.trim().length > 0;
  }

  return getWordCount(rawContent) >= minWords;
}
