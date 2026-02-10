export interface StyleAttributes {
  tone: string;
  vocabulary_level: string;
  sentence_style: string;
  personality_traits: string[];
  signature_phrases: string[];
  avoid_phrases: string[];
}

export interface BrandVoiceProfile {
  id: string;
  name: string;
  description: string | null;
  style_attributes: StyleAttributes;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
