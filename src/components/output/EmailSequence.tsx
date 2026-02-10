import { useState } from 'react';
import type { RepurposedOutput, EmailSequenceData } from '../../types/content';
import { CopyButton } from './CopyButton';

interface EmailSequenceProps {
  output: RepurposedOutput;
}

export function EmailSequence({ output }: EmailSequenceProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  let data: EmailSequenceData | null = null;
  try {
    data = JSON.parse(output.output_text) as EmailSequenceData;
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

  const allText = data.emails
    .map(
      (email) =>
        `Email ${email.email_number}: ${email.label}\nSubject: ${email.subject_line}\nPreview: ${email.preview_text}\n\n${email.body}\n\nCTA: ${email.cta_text}`,
    )
    .join('\n\n---\n\n');

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <CopyButton text={allText} label="Copy All" />
      </div>

      {data.emails.map((email, i) => {
        const isExpanded = expandedIndex === i;
        const emailText = `Subject: ${email.subject_line}\n\n${email.body}\n\nCTA: ${email.cta_text}`;

        return (
          <div key={i} className="rounded-lg border border-border bg-surface overflow-hidden">
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-alt transition-colors"
            >
              <div>
                <span className="text-xs font-medium text-primary">Email {email.email_number}</span>
                <span className="ml-2 text-sm font-medium text-text">{email.label}</span>
              </div>
              <span className="text-text-secondary text-sm">{isExpanded ? '-' : '+'}</span>
            </button>

            {isExpanded && (
              <div className="border-t border-border p-4 space-y-3">
                <div>
                  <span className="text-xs font-semibold uppercase text-text-secondary">Subject</span>
                  <p className="mt-1 text-sm font-medium text-text">{email.subject_line}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-text-secondary">Preview</span>
                  <p className="mt-1 text-sm text-text-secondary">{email.preview_text}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-text-secondary">Body</span>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text">
                    {email.body}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-text-secondary">CTA</span>
                  <p className="mt-1 text-sm font-medium text-primary">{email.cta_text}</p>
                </div>
                <div className="flex justify-end">
                  <CopyButton text={emailText} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
