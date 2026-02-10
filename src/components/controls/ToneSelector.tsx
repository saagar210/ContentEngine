import { useAppStore } from '../../stores/appStore';
import { TONE_META } from '../../lib/constants';
import type { TonePreset } from '../../types/platform';

const tones = Object.keys(TONE_META) as TonePreset[];

export function ToneSelector() {
  const { tone, setTone } = useAppStore();

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text">Tone</label>
      <div className="space-y-2">
        {tones.map((t) => {
          const meta = TONE_META[t];
          const selected = tone === t;
          return (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                selected
                  ? 'border-primary bg-primary-light'
                  : 'border-border bg-surface hover:border-primary/40'
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full border-2 transition-colors ${
                  selected ? 'border-primary bg-primary' : 'border-slate-300'
                }`}
              >
                {selected && (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <div>
                <div className={`font-medium ${selected ? 'text-primary' : 'text-text'}`}>
                  {meta.label}
                </div>
                <div className="text-xs text-text-secondary">{meta.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
