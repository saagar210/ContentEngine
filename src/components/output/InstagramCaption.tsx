import type { RepurposedOutput } from '../../types/content';
import { CopyButton } from './CopyButton';

interface InstagramCaptionProps {
  output: RepurposedOutput;
}

export function InstagramCaption({ output }: InstagramCaptionProps) {
  const text = output.output_text;
  const charCount = text.length;

  // Split hashtags from main text
  const hashtagMatch = text.match(/((?:\s*#\w+)+)\s*$/);
  const mainText = hashtagMatch ? text.slice(0, hashtagMatch.index) : text;
  const hashtags = hashtagMatch ? hashtagMatch[1].trim() : '';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium ${charCount > 2200 ? 'text-danger' : 'text-success'}`}
        >
          {charCount}/2200
        </span>
        <CopyButton text={text} />
      </div>
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{mainText}</p>
        {hashtags && (
          <p className="mt-3 text-sm text-primary">{hashtags}</p>
        )}
      </div>
    </div>
  );
}
