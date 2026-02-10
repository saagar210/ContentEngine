import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/tauriApi';
import type { HistoryDetail as HistoryDetailType } from '../../types/content';
import type { OutputFormat } from '../../types/platform';
import { OutputPanel } from '../output/OutputPanel';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorDisplay } from '../common/ErrorDisplay';

export function HistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<HistoryDetailType | null>(null);
  const [activeFormat, setActiveFormat] = useState<OutputFormat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .getHistoryDetail(id)
      .then((data) => {
        setDetail(data);
        if (data.outputs.length > 0) {
          setActiveFormat(data.outputs[0].format as OutputFormat);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleExport = async () => {
    if (!id) return;
    setExporting(true);
    try {
      await api.exportPdf(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <ErrorDisplay message={error} />;
  if (!detail) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-alt transition-colors"
          >
            Back
          </button>
          <h2 className="text-xl font-bold text-text">
            {detail.input.title ?? 'Untitled Content'}
          </h2>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-alt transition-colors disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-alt transition-colors"
        >
          <div>
            <span className="text-sm font-medium text-text">Original Content</span>
            <span className="ml-2 text-xs text-text-secondary">
              {detail.input.word_count} words
            </span>
          </div>
          <span className="text-text-secondary">{showOriginal ? '-' : '+'}</span>
        </button>
        {showOriginal && (
          <div className="border-t border-border p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
              {detail.input.raw_text}
            </p>
          </div>
        )}
      </div>

      <OutputPanel
        outputs={detail.outputs}
        activeFormat={activeFormat}
        onFormatChange={setActiveFormat}
      />
    </div>
  );
}
