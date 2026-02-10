import { useEffect, useCallback, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { api } from '../lib/tauriApi';

export function useUsage() {
  const { usage, setUsage } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const info = await api.getUsageInfo();
      setUsage(info);
    } catch {
      // Usage fetch is non-critical; silently ignore
    } finally {
      setIsLoading(false);
    }
  }, [setUsage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { usage, refresh, isLoading };
}
