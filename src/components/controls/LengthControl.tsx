import { useAppStore } from '../../stores/appStore';
import { LENGTH_META } from '../../lib/constants';
import type { LengthPreset } from '../../types/platform';

const lengths = Object.keys(LENGTH_META) as LengthPreset[];

export function LengthControl() {
  const { length, setLength } = useAppStore();

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text">Length</label>
      <div className="flex rounded-lg border border-border bg-surface p-1">
        {lengths.map((l) => (
          <button
            key={l}
            onClick={() => setLength(l)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              length === l
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            {LENGTH_META[l].label}
          </button>
        ))}
      </div>
    </div>
  );
}
