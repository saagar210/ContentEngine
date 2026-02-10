import { create } from 'zustand';
import type { OutputFormat, TonePreset, LengthPreset, PlatformConfig } from '../types/platform';
import type { RepurposedOutput } from '../types/content';
import type { BrandVoiceProfile } from '../types/brandVoice';
import type { UsageInfo } from '../types/usage';

interface AppState {
  // Content input
  rawContent: string;
  title: string;
  sourceUrl: string;
  useUrl: boolean;

  // Generation settings
  selectedFormats: OutputFormat[];
  tone: TonePreset;
  length: LengthPreset;
  selectedBrandVoiceId: string | null;
  platformConfig: PlatformConfig;

  // Generation state
  isGenerating: boolean;
  generationError: string | null;
  outputs: RepurposedOutput[];
  activeOutputFormat: OutputFormat | null;

  // Brand voices
  brandVoices: BrandVoiceProfile[];

  // Usage
  usage: UsageInfo | null;

  // Settings
  settingsOpen: boolean;

  // Actions
  setRawContent: (content: string) => void;
  setTitle: (title: string) => void;
  setSourceUrl: (url: string) => void;
  setUseUrl: (useUrl: boolean) => void;
  toggleFormat: (format: OutputFormat) => void;
  setTone: (tone: TonePreset) => void;
  setLength: (length: LengthPreset) => void;
  setSelectedBrandVoiceId: (id: string | null) => void;
  setPlatformConfig: (config: PlatformConfig) => void;
  setIsGenerating: (generating: boolean) => void;
  setGenerationError: (error: string | null) => void;
  setOutputs: (outputs: RepurposedOutput[]) => void;
  setActiveOutputFormat: (format: OutputFormat | null) => void;
  setBrandVoices: (voices: BrandVoiceProfile[]) => void;
  setUsage: (usage: UsageInfo | null) => void;
  setSettingsOpen: (open: boolean) => void;
  resetForm: () => void;
}

const initialFormState = {
  rawContent: '',
  title: '',
  sourceUrl: '',
  useUrl: false,
  selectedFormats: [] as OutputFormat[],
  tone: 'professional' as TonePreset,
  length: 'medium' as LengthPreset,
  selectedBrandVoiceId: null as string | null,
  platformConfig: {} as PlatformConfig,
  isGenerating: false,
  generationError: null as string | null,
  outputs: [] as RepurposedOutput[],
  activeOutputFormat: null as OutputFormat | null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialFormState,
  brandVoices: [],
  usage: null,
  settingsOpen: false,

  setRawContent: (content) => set({ rawContent: content }),
  setTitle: (title) => set({ title }),
  setSourceUrl: (url) => set({ sourceUrl: url }),
  setUseUrl: (useUrl) => set({ useUrl }),
  toggleFormat: (format) =>
    set((state) => ({
      selectedFormats: state.selectedFormats.includes(format)
        ? state.selectedFormats.filter((f) => f !== format)
        : [...state.selectedFormats, format],
    })),
  setTone: (tone) => set({ tone }),
  setLength: (length) => set({ length }),
  setSelectedBrandVoiceId: (id) => set({ selectedBrandVoiceId: id }),
  setPlatformConfig: (config) => set({ platformConfig: config }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setGenerationError: (error) => set({ generationError: error }),
  setOutputs: (outputs) => set({ outputs }),
  setActiveOutputFormat: (format) => set({ activeOutputFormat: format }),
  setBrandVoices: (voices) => set({ brandVoices: voices }),
  setUsage: (usage) => set({ usage }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  resetForm: () => set(initialFormState),
}));
