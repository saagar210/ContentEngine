import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS contexts
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-all ${
        copied
          ? 'border-success/40 bg-success/10 text-success'
          : 'bg-surface text-text-secondary hover:border-primary/40 hover:text-primary'
      } ${className}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}
