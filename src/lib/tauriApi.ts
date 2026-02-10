import { invoke } from '@tauri-apps/api/core';
import type { ContentInput, FetchedContent, RepurposeRequest, RepurposeResponse, HistoryPage, HistoryDetail } from '../types/content';
import type { BrandVoiceProfile } from '../types/brandVoice';
import type { UsageInfo } from '../types/usage';

interface AnalyzeVoiceRequest {
  name: string;
  description?: string;
  samples: string[];
}

export const api = {
  saveContent: (params: { text: string; source_url?: string; title?: string }) =>
    invoke<ContentInput>('save_content', params),

  fetchUrl: (url: string) =>
    invoke<FetchedContent>('fetch_url', { url }),

  repurposeContent: (request: RepurposeRequest) =>
    invoke<RepurposeResponse>('repurpose_content', { request }),

  getBrandVoices: () => invoke<BrandVoiceProfile[]>('get_brand_voices'),

  analyzeBrandVoice: (request: AnalyzeVoiceRequest) =>
    invoke<BrandVoiceProfile>('analyze_brand_voice', { request }),

  deleteBrandVoice: (id: string) => invoke<void>('delete_brand_voice', { id }),

  setDefaultVoice: (id: string) => invoke<void>('set_default_voice', { id }),

  getHistory: (page?: number, pageSize?: number) =>
    invoke<HistoryPage>('get_history', { page, page_size: pageSize }),

  getHistoryDetail: (id: string) =>
    invoke<HistoryDetail>('get_history_detail', { id }),

  deleteHistoryItem: (id: string) =>
    invoke<void>('delete_history_item', { id }),

  exportPdf: (contentInputId: string) =>
    invoke<string>('export_pdf', { content_input_id: contentInputId }),

  getUsageInfo: () => invoke<UsageInfo>('get_usage_info'),

  getApiKey: () => invoke<string>('get_api_key'),

  setApiKey: (apiKey: string) => invoke<void>('set_api_key', { api_key: apiKey }),
};
