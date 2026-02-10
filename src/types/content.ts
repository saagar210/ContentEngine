import type { OutputFormat, TonePreset, LengthPreset, PlatformConfig } from './platform';

export interface ContentInput {
  id: string;
  title: string | null;
  source_url: string | null;
  raw_text: string;
  word_count: number;
  created_at: string;
}

export interface FetchedContent {
  title: string | null;
  text: string;
  word_count: number;
}

export interface KeyPoints {
  main_thesis: string;
  key_arguments: string[];
  supporting_data: string[];
  target_audience: string;
  emotional_tone: string;
  call_to_action: string | null;
}

export interface RepurposedOutput {
  id: string;
  content_input_id: string;
  format: string;
  output_text: string;
  created_at: string;
}

export interface RepurposeRequest {
  content: string;
  source_url?: string;
  title?: string;
  formats: OutputFormat[];
  tone: TonePreset;
  length: LengthPreset;
  voice_id?: string;
  config?: PlatformConfig;
}

export interface RepurposeResponse {
  content_input_id: string;
  outputs: RepurposedOutput[];
}

export interface TwitterThreadData {
  tweets: string[];
}

export interface EmailSequenceData {
  emails: Array<{
    email_number: number;
    label: string;
    subject_line: string;
    preview_text: string;
    body: string;
    cta_text: string;
  }>;
}

export interface NewsletterData {
  subject_line: string;
  preview_text: string;
  body: string;
}

export interface HistoryItem {
  id: string;
  title: string | null;
  word_count: number;
  format_count: number;
  created_at: string;
}

export interface HistoryPage {
  items: HistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface HistoryDetail {
  input: ContentInput;
  outputs: RepurposedOutput[];
}
