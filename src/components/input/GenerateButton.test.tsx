import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { GenerateButton } from './GenerateButton';
import { useAppStore } from '../../stores/appStore';

const generateMock = vi.fn();

vi.mock('../../hooks/useRepurpose', () => ({
  useRepurpose: () => ({
    generate: generateMock,
    isGenerating: false,
  }),
}));

function words(count: number): string {
  return Array.from({ length: count }, (_, i) => `w${i}`).join(' ');
}

describe('GenerateButton', () => {
  beforeEach(() => {
    generateMock.mockReset();
    useAppStore.setState({
      rawContent: '',
      sourceUrl: '',
      useUrl: false,
      selectedFormats: [],
      isGenerating: false,
    });
  });

  it('is disabled when content is below threshold', () => {
    useAppStore.setState({
      rawContent: words(49),
      selectedFormats: ['summary'],
    });

    render(<GenerateButton />);

    expect(screen.getByRole('button', { name: 'Repurpose Content' })).toBeDisabled();
  });

  it('is enabled for minimum valid pasted content with selected format', () => {
    useAppStore.setState({
      rawContent: words(50),
      selectedFormats: ['summary'],
    });

    render(<GenerateButton />);

    expect(screen.getByRole('button', { name: 'Repurpose Content' })).toBeEnabled();
  });

  it('uses URL eligibility when URL mode is selected', () => {
    useAppStore.setState({
      useUrl: true,
      sourceUrl: '   ',
      rawContent: words(100),
      selectedFormats: ['summary'],
    });

    const { rerender } = render(<GenerateButton />);
    expect(screen.getByRole('button', { name: 'Repurpose Content' })).toBeDisabled();

    act(() => {
      useAppStore.setState({ sourceUrl: 'https://example.com/article' });
    });
    rerender(<GenerateButton />);

    expect(screen.getByRole('button', { name: 'Repurpose Content' })).toBeEnabled();
  });
});
