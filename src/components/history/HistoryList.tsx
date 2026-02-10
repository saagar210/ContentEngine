import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistory } from '../../hooks/useHistory';
import { api } from '../../lib/tauriApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorDisplay } from '../common/ErrorDisplay';

export function HistoryList() {
  const { items, total, page, pageSize, setPage, refresh, isLoading, error } = useHistory(20);
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteHistoryItem(id);
      refresh();
    } catch {
      // Error handling is non-critical here
    }
    setDeleteConfirm(null);
  };

  if (isLoading && items.length === 0) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border bg-surface p-12 text-center">
        <p className="text-lg font-medium text-text-secondary">No history yet</p>
        <p className="mt-1 text-sm text-text-secondary">Generated content will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-alt"
          >
            <button
              onClick={() => navigate(`/history/${item.id}`)}
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-text">
                    {item.title ?? 'Untitled Content'}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-secondary">
                    <span>{item.word_count} words</span>
                    <span>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">
                {item.format_count} format{item.format_count !== 1 ? 's' : ''}
              </span>

              {deleteConfirm === item.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="rounded-lg px-3 py-1.5 text-xs text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  className="rounded-lg px-2 py-1.5 text-xs text-text-secondary hover:text-danger transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-alt disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-alt disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
