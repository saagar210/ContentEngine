import { useAppStore } from '../../stores/appStore';
import { FORMAT_META } from '../../lib/constants';
import type { OutputFormat } from '../../types/platform';

const formats = Object.keys(FORMAT_META) as OutputFormat[];

export function FormatSelector() {
  const { selectedFormats, toggleFormat } = useAppStore();

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text">Output Formats</label>
      <div className="grid grid-cols-2 gap-2">
        {formats.map((format) => {
          const meta = FORMAT_META[format];
          const selected = selectedFormats.includes(format);
          return (
            <button
              key={format}
              onClick={() => toggleFormat(format)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                selected
                  ? 'border-primary bg-primary-light text-primary font-medium'
                  : 'border-border bg-surface text-text-secondary hover:border-primary/40 hover:bg-primary-light/30'
              }`}
            >
              <span className="text-base">{meta.icon}</span>
              <div>
                <div className={selected ? 'text-primary' : 'text-text'}>{meta.label}</div>
                <div className="text-xs text-text-secondary">{meta.description}</div>
              </div>
            </button>
          );
        })}
      </div>
      {selectedFormats.length === 0 && (
        <p className="mt-2 text-xs text-warning">Select at least one format</p>
      )}
    </div>
  );
}
