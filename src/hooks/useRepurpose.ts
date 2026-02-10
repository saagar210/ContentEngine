import { useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { api } from '../lib/tauriApi';
import type { RepurposeRequest } from '../types/content';
import type { OutputFormat } from '../types/platform';

export function useRepurpose() {
  const {
    rawContent,
    title,
    sourceUrl,
    useUrl,
    selectedFormats,
    tone,
    length,
    selectedBrandVoiceId,
    platformConfig,
    isGenerating,
    generationError,
    setIsGenerating,
    setGenerationError,
    setOutputs,
    setActiveOutputFormat,
  } = useAppStore();

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setOutputs([]);

    try {
      let content: string;
      let fetchedTitle: string | undefined;

      if (useUrl && sourceUrl) {
        const fetched = await api.fetchUrl(sourceUrl);
        content = fetched.text;
        fetchedTitle = fetched.title ?? undefined;
      } else {
        content = rawContent;
      }

      const request: RepurposeRequest = {
        content,
        source_url: useUrl ? sourceUrl : undefined,
        title: title || fetchedTitle,
        formats: selectedFormats,
        tone,
        length,
        voice_id: selectedBrandVoiceId ?? undefined,
        config: Object.keys(platformConfig).length > 0 ? platformConfig : undefined,
      };

      const response = await api.repurposeContent(request);
      setOutputs(response.outputs);

      if (response.outputs.length > 0) {
        setActiveOutputFormat(response.outputs[0].format as OutputFormat);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setGenerationError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [
    rawContent,
    title,
    sourceUrl,
    useUrl,
    selectedFormats,
    tone,
    length,
    selectedBrandVoiceId,
    platformConfig,
    setIsGenerating,
    setGenerationError,
    setOutputs,
    setActiveOutputFormat,
  ]);

  return { generate, isGenerating, error: generationError };
}
