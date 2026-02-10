import type { RepurposedOutput } from '../../types/content';
import { CopyButton } from './CopyButton';

interface LinkedInPostProps {
  output: RepurposedOutput;
}

export function LinkedInPost({ output }: LinkedInPostProps) {
  const text = output.output_text;
  const charCount = text.length;
  const foldIndex = 140;
  const hasFold = text.length > foldIndex;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${charCount > 3000 ? 'text-danger' : 'text-success'}`}>
          {charCount}/3000
        </span>
        <CopyButton text={text} />
      </div>
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="text-sm leading-relaxed text-text">
          {hasFold ? (
            <>
              <span>{text.slice(0, foldIndex)}</span>
              <span className="mx-1 inline-block rounded bg-slate-200 px-1.5 py-0.5 text-xs text-text-secondary">
                ...see more
              </span>
              <span className="text-text-secondary">{text.slice(foldIndex)}</span>
            </>
          ) : (
            <span className="whitespace-pre-wrap">{text}</span>
          )}
        </div>
      </div>
    </div>
  );
}
