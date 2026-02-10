import { useAppStore } from '../../stores/appStore';
import { useRepurpose } from '../../hooks/useRepurpose';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function GenerateButton() {
  const { rawContent, sourceUrl, useUrl, selectedFormats } = useAppStore();
  const { generate, isGenerating } = useRepurpose();

  const wordCount = rawContent.trim() ? rawContent.trim().split(/\s+/).length : 0;
  const hasContent = useUrl ? sourceUrl.trim().length > 0 : wordCount >= 50;
  const hasFormats = selectedFormats.length > 0;
  const canGenerate = hasContent && hasFormats && !isGenerating;

  return (
    <button
      onClick={generate}
      disabled={!canGenerate}
      className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
    >
      {isGenerating ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          Generating...
        </span>
      ) : (
        'Repurpose Content'
      )}
    </button>
  );
}
