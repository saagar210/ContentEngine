import { useAppStore } from '../../stores/appStore';
import { useRepurpose } from '../../hooks/useRepurpose';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { hasEligibleContent } from '../../lib/contentValidation';

export function GenerateButton() {
  const { rawContent, sourceUrl, useUrl, selectedFormats } = useAppStore();
  const { generate, isGenerating } = useRepurpose();

  const hasContent = hasEligibleContent({ useUrl, sourceUrl, rawContent });
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
