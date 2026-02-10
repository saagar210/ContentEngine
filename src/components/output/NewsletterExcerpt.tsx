import type { RepurposedOutput, NewsletterData } from '../../types/content';
import { CopyButton } from './CopyButton';

interface NewsletterExcerptProps {
  output: RepurposedOutput;
}

export function NewsletterExcerpt({ output }: NewsletterExcerptProps) {
  let data: NewsletterData | null = null;
  try {
    data = JSON.parse(output.output_text) as NewsletterData;
  } catch {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="whitespace-pre-wrap text-sm text-text">{output.output_text}</p>
        <div className="mt-3 flex justify-end">
          <CopyButton text={output.output_text} />
        </div>
      </div>
    );
  }

  const fullText = `Subject: ${data.subject_line}\nPreview: ${data.preview_text}\n\n${data.body}`;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CopyButton text={fullText} label="Copy All" />
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-text-secondary">Subject Line</span>
              <span className="text-xs text-text-secondary">{data.subject_line.length}/50</span>
            </div>
            <p className="mt-1 text-sm font-medium text-text">{data.subject_line}</p>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-text-secondary">Preview Text</span>
              <span className="text-xs text-text-secondary">{data.preview_text.length}/80</span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">{data.preview_text}</p>
          </div>

          <div className="border-t border-border pt-3">
            <span className="text-xs font-semibold uppercase text-text-secondary">Body</span>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text">{data.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
