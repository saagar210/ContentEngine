import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { getWordCount, hasEligibleContent, MIN_CONTENT_WORDS } from '../../lib/contentValidation';

export function ContentInput() {
  const { rawContent, setRawContent, title, setTitle, sourceUrl, setSourceUrl, useUrl, setUseUrl } =
    useAppStore();
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const wordCount = getWordCount(rawContent);
  const isValid = hasEligibleContent({ useUrl, sourceUrl, rawContent });

  const handleFetch = async () => {
    if (!sourceUrl.trim()) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const { api } = await import('../../lib/tauriApi');
      const content = await api.fetchUrl(sourceUrl.trim());
      setRawContent(content.text);
      if (content.title) setTitle(content.title);
      setUseUrl(false);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setUseUrl(false)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            !useUrl ? 'bg-primary text-white' : 'bg-surface-alt text-text-secondary hover:text-text'
          }`}
        >
          Paste Content
        </button>
        <button
          onClick={() => setUseUrl(true)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            useUrl ? 'bg-primary text-white' : 'bg-surface-alt text-text-secondary hover:text-text'
          }`}
        >
          From URL
        </button>
      </div>

      {useUrl ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleFetch}
              disabled={isFetching || !sourceUrl.trim()}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {isFetching ? <LoadingSpinner size="sm" /> : 'Fetch'}
            </button>
          </div>
          {fetchError && <p className="text-sm text-danger">{fetchError}</p>}
        </div>
      ) : (
        <div className="relative">
          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder={`Paste your article, blog post, or content here (min. ${MIN_CONTENT_WORDS} words)...`}
            rows={12}
            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-text placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span
              className={`text-xs font-medium ${
                wordCount >= MIN_CONTENT_WORDS ? 'text-success' : 'text-text-secondary'
              }`}
            >
              {wordCount} words
            </span>
            {!isValid && wordCount > 0 && (
              <span className="text-xs text-warning">min {MIN_CONTENT_WORDS}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
