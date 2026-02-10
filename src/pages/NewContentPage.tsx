import { useAppStore } from '../stores/appStore';
import { useRepurpose } from '../hooks/useRepurpose';
import { ContentInput } from '../components/input/ContentInput';
import { FormatSelector } from '../components/input/FormatSelector';
import { GenerateButton } from '../components/input/GenerateButton';
import { ToneSelector } from '../components/controls/ToneSelector';
import { LengthControl } from '../components/controls/LengthControl';
import { BrandVoiceSelector } from '../components/controls/BrandVoiceSelector';
import { OutputPanel } from '../components/output/OutputPanel';
import { ErrorDisplay } from '../components/common/ErrorDisplay';

export function NewContentPage() {
  const { outputs, activeOutputFormat, setActiveOutputFormat, generationError, setGenerationError } =
    useAppStore();
  const { error } = useRepurpose();

  const displayError = generationError ?? error;

  return (
    <div className="flex h-full">
      {/* Left: Input + Controls */}
      <div className="w-[460px] shrink-0 overflow-y-auto border-r border-border bg-surface p-6">
        <h2 className="text-xl font-bold text-text">New Content</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Paste or fetch content to repurpose
        </p>

        <div className="mt-6 space-y-6">
          <ContentInput />

          <div className="border-t border-border pt-6">
            <ToneSelector />
          </div>

          <LengthControl />

          <BrandVoiceSelector />

          <div className="border-t border-border pt-6">
            <FormatSelector />
          </div>

          {displayError && (
            <ErrorDisplay
              message={displayError}
              onDismiss={() => setGenerationError(null)}
            />
          )}

          <GenerateButton />
        </div>
      </div>

      {/* Right: Output */}
      <div className="flex-1 overflow-y-auto p-6">
        <OutputPanel
          outputs={outputs}
          activeFormat={activeOutputFormat}
          onFormatChange={setActiveOutputFormat}
        />
      </div>
    </div>
  );
}
