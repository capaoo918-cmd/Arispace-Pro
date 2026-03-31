import { create } from 'zustand';

interface ArispaceState {
  currentPrompt: string;
  aestheticScore: number;
  colorPalette: string[];
  conceptDescription: string;
  currentImageUrl: string;
  activeImages: string[];
  
  setConceptData: (prompt: string, score: number, palette: string[], description: string, imageUrl: string) => void;
  addImage: (url: string) => void;
  clearWorkspace: () => void;
}

export const useArispaceStore = create<ArispaceState>((set) => ({
  currentPrompt: '',
  aestheticScore: 0.00,
  colorPalette: [], // Safe initial array
  conceptDescription: '',
  currentImageUrl: '',
  activeImages: [], // Safe initial array

  setConceptData: (prompt, score, palette, description, imageUrl) => set({
    currentPrompt: prompt ?? '',
    aestheticScore: Number(score) || 0.00,
    colorPalette: Array.isArray(palette) ? palette : [],
    conceptDescription: description ?? '',
    currentImageUrl: imageUrl ?? '',
  }),

  addImage: (url) => set((state) => ({
    activeImages: [...state.activeImages, url]
  })),

  clearWorkspace: () => set({
    currentPrompt: '',
    aestheticScore: 0.00,
    colorPalette: [],
    conceptDescription: '',
    currentImageUrl: '',
    activeImages: [],
  }),
}));
