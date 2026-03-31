export type View = 'icebreaker' | 'materials' | 'moodboard' | 'reports';

export interface Concept {
  title: string;
  description: string;
  aestheticScore: number;
  orderScore: number;
  complexityScore: number;
  imagePrompt: string;
  imageUrl?: string;
}

export interface Material {
  id: string;
  name: string;
  hex: string;
  lrv: number;
  source: string;
  specId: string;
  fireRating: string;
  imageUrl: string;
}

export interface MoodboardItem {
  id: string;
  type: 'image' | 'texture' | 'sketch';
  url: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  label?: string;
  score?: number;
  className?: string;
}
