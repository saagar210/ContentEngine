import { useState } from 'react';
import { useBrandVoice } from '../../hooks/useBrandVoice';
import { BrandVoiceUpload } from './BrandVoiceUpload';
import { BrandVoicePreview } from './BrandVoicePreview';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorDisplay } from '../common/ErrorDisplay';

export function BrandVoiceManager() {
  const { voices, isAnalyzing, isLoading, error, analyze, deleteVoice, setDefault } = useBrandVoice();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorDisplay message={error} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">Brand Voices</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Analyze your writing style to maintain consistency
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {showCreate ? 'Cancel' : 'New Voice'}
        </button>
      </div>

      {showCreate && (
        <BrandVoiceUpload
          onAnalyze={async (name: string, samples: string[]) => {
            await analyze(name, samples);
            setShowCreate(false);
          }}
          isAnalyzing={isAnalyzing}
        />
      )}

      {voices.length === 0 && !showCreate ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-surface p-12 text-center">
          <p className="text-lg font-medium text-text-secondary">No brand voices yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Create one to keep your content on-brand
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {voices.map((voice) => (
            <div
              key={voice.id}
              className="rounded-xl border border-border bg-surface shadow-sm"
            >
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => setExpandedId(expandedId === voice.id ? null : voice.id)}
                  className="flex items-center gap-3 text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text">{voice.name}</span>
                      {voice.is_default && (
                        <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
                          Default
                        </span>
                      )}
                    </div>
                    {voice.description && (
                      <p className="mt-0.5 text-sm text-text-secondary">{voice.description}</p>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  {!voice.is_default && (
                    <button
                      onClick={() => setDefault(voice.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-alt hover:text-text transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  {deleteConfirm === voice.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          deleteVoice(voice.id);
                          setDeleteConfirm(null);
                        }}
                        className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(voice.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-danger transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {expandedId === voice.id && (
                <div className="border-t border-border p-4">
                  <BrandVoicePreview attributes={voice.style_attributes} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
