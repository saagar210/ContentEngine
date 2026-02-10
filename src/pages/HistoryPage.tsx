import { HistoryList } from '../components/history/HistoryList';

export function HistoryPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="text-xl font-bold text-text">History</h2>
      <p className="mt-1 text-sm text-text-secondary">
        View and manage your previously generated content
      </p>
      <div className="mt-6">
        <HistoryList />
      </div>
    </div>
  );
}
