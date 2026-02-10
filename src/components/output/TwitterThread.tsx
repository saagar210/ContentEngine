import type { RepurposedOutput } from '../../types/content';
import { CopyButton } from './CopyButton';

interface TwitterThreadProps {
  output: RepurposedOutput;
}

export function TwitterThread({ output }: TwitterThreadProps) {
  let tweets: string[] = [];
  try {
    const parsed: unknown = JSON.parse(output.output_text);
    if (Array.isArray(parsed)) {
      tweets = parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    tweets = [output.output_text];
  }

  const allText = tweets.join('\n\n---\n\n');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          {tweets.length} tweet{tweets.length !== 1 ? 's' : ''}
        </span>
        <CopyButton text={allText} label="Copy All" />
      </div>
      <div className="space-y-3">
        {tweets.map((tweet, i) => {
          const charCount = tweet.length;
          const isOver = charCount > 280;
          return (
            <div key={i} className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">
                  {i + 1}/{tweets.length}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${isOver ? 'text-danger' : 'text-success'}`}
                  >
                    {charCount}/280
                  </span>
                  <CopyButton text={tweet} />
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{tweet}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
