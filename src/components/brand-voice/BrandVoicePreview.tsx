import type { StyleAttributes } from '../../types/brandVoice';

interface BrandVoicePreviewProps {
  attributes: StyleAttributes;
}

export function BrandVoicePreview({ attributes }: BrandVoicePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-text-secondary">Tone</span>
          <p className="mt-1 text-sm text-text">{attributes.tone}</p>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase text-text-secondary">Vocabulary</span>
          <p className="mt-1 text-sm text-text">{attributes.vocabulary_level}</p>
        </div>
        <div className="col-span-2">
          <span className="text-xs font-semibold uppercase text-text-secondary">Sentence Style</span>
          <p className="mt-1 text-sm text-text">{attributes.sentence_style}</p>
        </div>
      </div>

      {attributes.personality_traits.length > 0 && (
        <div>
          <span className="text-xs font-semibold uppercase text-text-secondary">Personality Traits</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {attributes.personality_traits.map((trait) => (
              <span
                key={trait}
                className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {attributes.signature_phrases.length > 0 && (
        <div>
          <span className="text-xs font-semibold uppercase text-text-secondary">Signature Phrases</span>
          <ul className="mt-2 space-y-1">
            {attributes.signature_phrases.map((phrase) => (
              <li key={phrase} className="text-sm text-text">
                &ldquo;{phrase}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}

      {attributes.avoid_phrases.length > 0 && (
        <div>
          <span className="text-xs font-semibold uppercase text-text-secondary">Avoid</span>
          <ul className="mt-2 space-y-1">
            {attributes.avoid_phrases.map((phrase) => (
              <li key={phrase} className="text-sm text-danger/80">
                &ldquo;{phrase}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
