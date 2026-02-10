interface ErrorDisplayProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorDisplay({ message, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-danger font-bold">!</span>
        <div className="flex-1">
          <p className="text-sm text-danger font-medium">Something went wrong</p>
          <p className="mt-1 text-sm text-text-secondary">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-text-secondary hover:text-text transition-colors"
            aria-label="Dismiss error"
          >
            x
          </button>
        )}
      </div>
    </div>
  );
}
