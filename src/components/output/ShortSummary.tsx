import type { RepurposedOutput } from '../../types/content';
import { CopyButton } from './CopyButton';

interface ShortSummaryProps {
  output: RepurposedOutput;
}

export function ShortSummary({ output }: ShortSummaryProps) {
  const text = output.output_text;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">
          {text.length} chars
        </span>
        <CopyButton text={text} />
      </div>
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{text}</p>
      </div>
    </div>
  );
}
