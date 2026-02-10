export type OutputFormat =
  | 'twitter_thread'
  | 'linkedin'
  | 'instagram'
  | 'newsletter'
  | 'email_sequence'
  | 'summary';

export type TonePreset = 'casual' | 'professional' | 'storytelling' | 'educational';
export type LengthPreset = 'short' | 'medium' | 'long';

export interface PlatformConfig {
  tweet_count?: number;
  hashtag_count?: number;
  include_emojis?: boolean;
}

export const PLATFORM_LIMITS = {
  twitter_thread: { chars_per_tweet: 280, min_tweets: 3, max_tweets: 15, default_tweets: 10 },
  linkedin: { max_chars: 3000, see_more_cutoff: 140, optimal_length: 1300, max_hashtags: 5 },
  instagram: { max_chars: 2200, preview_chars: 125, max_hashtags: 5 },
  newsletter: { subject_max_chars: 50, preview_text_chars: 80, body_word_count: { short: 100, medium: 200, long: 400 } },
  email_sequence: {
    email_count: 3,
    email1_words: { short: 50, medium: 75, long: 100 },
    email2_words: { short: 100, medium: 150, long: 200 },
    email3_words: { short: 75, medium: 100, long: 150 },
  },
  summary: { sentences: { short: 1, medium: 2, long: 3 } },
} as const;
