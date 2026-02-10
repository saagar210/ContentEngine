import type { RepurposedOutput } from '../../types/content';
import type { OutputFormat } from '../../types/platform';
import { FORMAT_META } from '../../lib/constants';
import { TwitterThread } from './TwitterThread';
import { LinkedInPost } from './LinkedInPost';
import { InstagramCaption } from './InstagramCaption';
import { NewsletterExcerpt } from './NewsletterExcerpt';
import { EmailSequence } from './EmailSequence';
import { ShortSummary } from './ShortSummary';

interface OutputPanelProps {
  outputs: RepurposedOutput[];
  activeFormat: OutputFormat | null;
  onFormatChange: (format: OutputFormat) => void;
}

const formatComponents: Record<OutputFormat, React.ComponentType<{ output: RepurposedOutput }>> = {
  twitter_thread: TwitterThread,
  linkedin: LinkedInPost,
  instagram: InstagramCaption,
  newsletter: NewsletterExcerpt,
  email_sequence: EmailSequence,
  summary: ShortSummary,
};

export function OutputPanel({ outputs, activeFormat, onFormatChange }: OutputPanelProps) {
  if (outputs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface p-12">
        <div className="text-center">
          <p className="text-lg font-medium text-text-secondary">No output yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Paste content and click Repurpose to generate
          </p>
        </div>
      </div>
    );
  }

  const formats = outputs.map((o) => o.format as OutputFormat);
  const activeOutput = outputs.find((o) => o.format === activeFormat) ?? outputs[0];
  const Component = formatComponents[activeOutput.format as OutputFormat];

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
        {formats.map((format) => {
          const meta = FORMAT_META[format];
          const isActive = format === (activeOutput.format as OutputFormat);
          return (
            <button
              key={format}
              onClick={() => onFormatChange(format)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-surface-alt hover:text-text'
              }`}
            >
              <span>{meta.icon}</span>
              {meta.label}
            </button>
          );
        })}
      </div>
      <div className="p-4">
        <Component output={activeOutput} />
      </div>
    </div>
  );
}
