import { useState } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface BrandVoiceUploadProps {
  onAnalyze: (name: string, samples: string[]) => Promise<void>;
  isAnalyzing: boolean;
}

interface SampleEntry {
  text: string;
}

const EMPTY_SAMPLE: SampleEntry = { text: '' };
const MIN_SAMPLES = 3;
const MAX_SAMPLES = 5;

export function BrandVoiceUpload({ onAnalyze, isAnalyzing }: BrandVoiceUploadProps) {
  const [name, setName] = useState('');
  const [samples, setSamples] = useState<SampleEntry[]>([
    { ...EMPTY_SAMPLE },
    { ...EMPTY_SAMPLE },
    { ...EMPTY_SAMPLE },
  ]);

  const updateSample = (index: number, value: string) => {
    setSamples((prev) => prev.map((s, i) => (i === index ? { text: value } : s)));
  };

  const addSample = () => {
    if (samples.length < MAX_SAMPLES) {
      setSamples((prev) => [...prev, { ...EMPTY_SAMPLE }]);
    }
  };

  const removeSample = (index: number) => {
    if (samples.length > MIN_SAMPLES) {
      setSamples((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const filledSamples = samples.filter((s) => s.text.trim().length > 0);
  const canAnalyze = name.trim().length > 0 && filledSamples.length >= MIN_SAMPLES && !isAnalyzing;

  const handleSubmit = async () => {
    if (!canAnalyze) return;
    const validSamples = samples.filter((s) => s.text.trim().length > 0);
    await onAnalyze(
      name.trim(),
      validSamples.map((s) => s.text.trim()),
    );
    setName('');
    setSamples([{ ...EMPTY_SAMPLE }, { ...EMPTY_SAMPLE }, { ...EMPTY_SAMPLE }]);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-text">Create Brand Voice</h3>
      <p className="mt-1 text-sm text-text-secondary">
        Provide 3-5 writing samples and we will analyze your style.
      </p>

      <div className="mt-4">
        <label className="block text-sm font-medium text-text" htmlFor="voice-name">
          Voice Name
        </label>
        <input
          id="voice-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My Blog Voice"
          className="mt-1 w-full rounded-lg border border-border bg-surface-alt px-3 py-2.5 text-sm text-text placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-4 space-y-4">
        {samples.map((sample, i) => (
          <div key={i} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text">Sample {i + 1}</span>
              {samples.length > MIN_SAMPLES && (
                <button
                  onClick={() => removeSample(i)}
                  className="text-xs text-text-secondary hover:text-danger transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <textarea
              value={sample.text}
              onChange={(e) => updateSample(i, e.target.value)}
              placeholder="Paste a writing sample here..."
              rows={4}
              className="mt-2 w-full resize-none rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        ))}
      </div>

      {samples.length < MAX_SAMPLES && (
        <button
          onClick={addSample}
          className="mt-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          + Add Another Sample
        </button>
      )}

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={!canAnalyze}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Analyzing...
            </span>
          ) : (
            'Analyze My Voice'
          )}
        </button>
        {filledSamples.length < MIN_SAMPLES && (
          <p className="mt-2 text-xs text-warning">
            {MIN_SAMPLES - filledSamples.length} more sample{MIN_SAMPLES - filledSamples.length !== 1 ? 's' : ''} needed
          </p>
        )}
      </div>
    </div>
  );
}
