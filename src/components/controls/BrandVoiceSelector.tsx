import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useBrandVoice } from '../../hooks/useBrandVoice';

export function BrandVoiceSelector() {
  const { selectedBrandVoiceId, setSelectedBrandVoiceId } = useAppStore();
  const { voices, isLoading } = useBrandVoice();

  useEffect(() => {
    if (!selectedBrandVoiceId && voices.length > 0) {
      const defaultVoice = voices.find((v) => v.is_default);
      if (defaultVoice) {
        setSelectedBrandVoiceId(defaultVoice.id);
      }
    }
  }, [voices, selectedBrandVoiceId, setSelectedBrandVoiceId]);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text">Brand Voice</label>
      <select
        value={selectedBrandVoiceId ?? ''}
        onChange={(e) => setSelectedBrandVoiceId(e.target.value || null)}
        disabled={isLoading}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">None (default)</option>
        {voices.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.name} {voice.is_default ? '(default)' : ''}
          </option>
        ))}
      </select>
      <Link
        to="/brand-voice"
        className="mt-1.5 inline-block text-xs text-primary hover:text-primary-hover"
      >
        Manage voices
      </Link>
    </div>
  );
}
