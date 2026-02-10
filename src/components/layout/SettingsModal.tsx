import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../lib/tauriApi';

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen } = useAppStore();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (settingsOpen) {
      api.getApiKey().then((key) => {
        if (key) setApiKey(key);
      }).catch(() => {});
    }
  }, [settingsOpen]);

  if (!settingsOpen) return null;

  const handleSave = async () => {
    setStatus('saving');
    try {
      await api.setApiKey(apiKey);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="rounded-lg p-1 text-text-secondary hover:bg-surface-alt hover:text-text"
          >
            x
          </button>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-text" htmlFor="api-key">
            Anthropic API Key
          </label>
          <div className="relative mt-2">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2.5 pr-16 text-sm text-text placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-text-secondary hover:text-text"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={status === 'saving' || !apiKey}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {status === 'saving' ? 'Saving...' : 'Save'}
          </button>
          {status === 'saved' && (
            <span className="text-sm text-success">Saved</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-danger">Failed to save</span>
          )}
        </div>
      </div>
    </div>
  );
}
