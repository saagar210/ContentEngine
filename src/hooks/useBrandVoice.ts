import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { api } from '../lib/tauriApi';

export function useBrandVoice() {
  const { brandVoices, setBrandVoices } = useAppStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const voices = await api.getBrandVoices();
      setBrandVoices(voices);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [setBrandVoices]);

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  const analyze = useCallback(
    async (name: string, samples: string[]) => {
      setIsAnalyzing(true);
      setError(null);
      try {
        await api.analyzeBrandVoice({ name, samples });
        await loadVoices();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [loadVoices],
  );

  const deleteVoice = useCallback(
    async (id: string) => {
      try {
        await api.deleteBrandVoice(id);
        await loadVoices();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [loadVoices],
  );

  const setDefault = useCallback(
    async (id: string) => {
      try {
        await api.setDefaultVoice(id);
        await loadVoices();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [loadVoices],
  );

  return { voices: brandVoices, isAnalyzing, isLoading, error, analyze, deleteVoice, setDefault, refresh: loadVoices };
}
