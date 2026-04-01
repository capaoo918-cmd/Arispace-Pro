import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedMaterial {
  id: string;
  name: string;
  imageUrl: string;
  lrv: string;
  notes: string;
  category: string; // 'Suelos', 'Paredes', 'Telas', o 'Carpeta'
  folderId?: string;
}

export interface SavedThought {
  id: string;
  text: string;
  timestamp: string;
}

export interface AgendaTask {
  id: string;
  title: string;
  deadline: string; // ISO String or formatted string
  time: string; // "14:00"
  completed: boolean;
}

export interface MaterialFolder {
  id: string;
  name: string;
}

export interface WorkspaceItem {
  id: string;
  assetId: string;
  imageUrl: string;
  x: number;
  y: number;
  zIndex: number;
  width: number;
  height: number;
  rotation: number;
  blendMode?: 'normal' | 'multiply';
}

export interface ProjectVersion {
  id: string;
  name: string;
  timestamp: string;
  thumbnailBase64: string;
  items: WorkspaceItem[];
}
interface ArispaceState {
  currentPrompt: string;
  aestheticScore: number;
  colorPalette: string[];
  conceptDescription: string;
  currentImageUrl: string;
  activeImages: string[];
  allConcepts: { id: string, imageUrl: string, prompt: string, type?: 'image' | 'texture' }[];
  workspaceItems: WorkspaceItem[];
  projectVersions: ProjectVersion[];
  savedMaterials: SavedMaterial[];
  isInspectorMode: boolean;
  backgroundImage: string | null;
  isBackgroundLocked: boolean;
  layerOpacity: number;
  promptHistory: string[];
  isHDMode: boolean;
  savedThoughts: SavedThought[];
  materialFolders: MaterialFolder[];
  
  toggleInspectorMode: () => void;
  setBackgroundImage: (url: string | null) => void;
  toggleBackgroundLock: () => void;
  setLayerOpacity: (opacity: number) => void;
  addPromptToHistory: (prompt: string) => void;
  setHDMode: (isHD: boolean) => void;
  setConceptData: (prompt: string, score: number, palette: string[], description: string, imageUrl: string) => void;
  addImage: (url: string) => void;
  clearWorkspace: () => void;
  addAssetToWorkspace: (item: WorkspaceItem) => void;
  updateItemPosition: (id: string, x: number, y: number) => void;
  updateItemDimensions: (id: string, width: number, height: number, rotation: number) => void;
  updateItemBlendMode: (id: string, mode: 'normal' | 'multiply') => void;
  removeWorkspaceItem: (id: string) => void;
  reorderWorkspaceItem: (id: string, direction: 'up' | 'down') => void;
  bringToFrontWorkspaceItem: (id: string) => void;
  saveCurrentVersion: (name: string, thumbnailBase64: string) => void;
  loadVersion: (id: string) => void;
  addExternalConcept: (url: string) => void;
  addTextureToWorkspace: (material: SavedMaterial) => void;
  addThought: (text: string) => void;
  deleteThought: (id: string) => void;
  addMaterialFolder: (name: string) => void;
  saveMaterialMeta: (id: string, name: string, category: string, folderId?: string) => void;
  addSavedMaterial: (material: Omit<SavedMaterial, 'id'>) => void;
  
  agendaTasks: AgendaTask[];
  addAgendaTask: (task: Omit<AgendaTask, 'id' | 'completed'>) => void;
  toggleAgendaTask: (id: string) => void;
  deleteAgendaTask: (id: string) => void;

  // Privacy Engine & Appearance
  isLocked: boolean;
  setIsLocked: (lock: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  autoLockTime: number; // in minutes
  setAutoLockTime: (minutes: number) => void;
}

export const useArispaceStore = create<ArispaceState>()(
  persist(
    (set) => ({
      currentPrompt: '',
  aestheticScore: 0.00,
  colorPalette: [], // Safe initial array
  conceptDescription: '',
  currentImageUrl: '',
  activeImages: [], // Safe initial array
  savedMaterials: [
    { id: 'tex-marmol', name: 'Mármol Carrara', imageUrl: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=400&q=80', lrv: '75%', notes: 'Revestimiento clásico', category: 'Paredes' },
    { id: 'tex-roble', name: 'Roble Oscuro', imageUrl: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80', lrv: '18%', notes: 'FSC Certified', category: 'Suelos' },
    { id: 'tex-acero', name: 'Acero Inox', imageUrl: 'https://images.unsplash.com/photo-1567360425618-1594206637d2?auto=format&fit=crop&w=400&q=80', lrv: '45%', notes: 'Acabado industrial cepillado', category: 'Paredes' }
  ],
  allConcepts: [],
  workspaceItems: [],
  projectVersions: [],
  isInspectorMode: false,
  backgroundImage: null,
  isBackgroundLocked: false,
  layerOpacity: 1.0,
  promptHistory: [],
  isHDMode: true,
  savedThoughts: [],
  materialFolders: [],
  agendaTasks: [],
  isLocked: true,
  isDarkMode: false,
  autoLockTime: 0,

  toggleInspectorMode: () => set((state) => ({ isInspectorMode: !state.isInspectorMode })),
  setBackgroundImage: (url) => set({ backgroundImage: url }),
  toggleBackgroundLock: () => set((state) => ({ isBackgroundLocked: !state.isBackgroundLocked })),
  setLayerOpacity: (opacity) => set({ layerOpacity: opacity }),
  setHDMode: (isHD) => set({ isHDMode: isHD }),

  addPromptToHistory: (prompt) => set((state) => {
    if (!prompt.trim()) return state;
    // Evitar duplicados consecutivos y limitar a 15
    const filtered = state.promptHistory.filter(p => p !== prompt);
    const newHistory = [prompt, ...filtered].slice(0, 15);
    return { promptHistory: newHistory };
  }),

  setConceptData: (prompt, score, palette, description, imageUrl) => set((state) => {
    const MAX_CONCEPTS = 10;
    const newEntry = imageUrl
      ? [{ id: Date.now().toString(), imageUrl, prompt: prompt ?? '', type: 'image' as const }]
      : [];
    const newConcepts = [...newEntry, ...state.allConcepts].slice(0, MAX_CONCEPTS);
    return {
      currentPrompt: prompt ?? '',
      aestheticScore: Number(score) || 0.00,
      colorPalette: Array.isArray(palette) ? palette : [],
      conceptDescription: description ?? '',
      currentImageUrl: imageUrl ?? '',
      allConcepts: newConcepts,
    };
  }),

  addExternalConcept: (url) => set((state) => ({
    allConcepts: [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
        imageUrl: url,
        prompt: 'Importación Externa (URL)',
        type: 'image'
      },
      ...state.allConcepts,
    ],
  })),

  addTextureToWorkspace: (material) => set((state) => ({
    allConcepts: [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
        imageUrl: material.imageUrl,
        prompt: `Textura: ${material.name}`,
        type: 'texture'
      },
      ...state.allConcepts,
    ]
  })),

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
    // nota: conservamos allConcepts en el clear básico para la sidebar
    workspaceItems: [],
    backgroundImage: null,
    isBackgroundLocked: false,
    layerOpacity: 1.0,
  }),

  addAssetToWorkspace: (item) => set((state) => ({
    workspaceItems: [...state.workspaceItems, item]
  })),

  updateItemPosition: (id, x, y) => set((state) => ({
    workspaceItems: state.workspaceItems.map((item) => 
      item.id === id ? { ...item, x, y } : item
    )
  })),

  updateItemDimensions: (id, width, height, rotation) => set((state) => ({
    workspaceItems: state.workspaceItems.map((item) => 
      item.id === id ? { ...item, width, height, rotation } : item
    )
  })),

  updateItemBlendMode: (id, mode) => set((state) => ({
    workspaceItems: state.workspaceItems.map((item) => 
      item.id === id ? { ...item, blendMode: mode } : item
    )
  })),

  removeWorkspaceItem: (id) => set((state) => ({
    workspaceItems: state.workspaceItems.filter(item => item.id !== id)
  })),

  reorderWorkspaceItem: (id, direction) => set((state) => {
    const items = [...state.workspaceItems];
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return state;

    items.sort((a, b) => a.zIndex - b.zIndex);
    const sortedIndex = items.findIndex(item => item.id === id);

    if (direction === 'up' && sortedIndex < items.length - 1) {
      const temp = items[sortedIndex].zIndex;
      items[sortedIndex].zIndex = items[sortedIndex + 1].zIndex;
      items[sortedIndex + 1].zIndex = temp;
    } else if (direction === 'down' && sortedIndex > 0) {
      const temp = items[sortedIndex].zIndex;
      items[sortedIndex].zIndex = items[sortedIndex - 1].zIndex;
      items[sortedIndex - 1].zIndex = temp;
    } else if (direction === 'up' && sortedIndex === items.length - 1) {
      items[sortedIndex].zIndex += 1;
    }

    return { workspaceItems: items };
  }),

  bringToFrontWorkspaceItem: (id) => set((state) => {
    const items = [...state.workspaceItems];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return state;
    
    // Encontrar el zIndex más alto y sumar 1
    const maxZ = items.reduce((max, item) => Math.max(max, item.zIndex), 0);
    items[index].zIndex = maxZ + 1;
    
    return { workspaceItems: items };
  }),

  saveCurrentVersion: (name, thumbnailBase64) => set((state) => ({
    projectVersions: [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
        name,
        timestamp: new Date().toISOString(),
        thumbnailBase64,
        items: [...state.workspaceItems].map(item => ({ ...item })), // deep copy
      },
      ...state.projectVersions,
    ],
  })),

  loadVersion: (id) => set((state) => {
    const version = state.projectVersions.find(v => v.id === id);
    if (!version) return state;
    return { workspaceItems: [...version.items].map(item => ({ ...item })) };
  }),

  addThought: (text) => set((state) => ({
    savedThoughts: [
      { id: Date.now().toString(), text, timestamp: new Date().toLocaleTimeString() },
      ...state.savedThoughts
    ]
  })),

  deleteThought: (id) => set((state) => ({
    savedThoughts: state.savedThoughts.filter(t => t.id !== id)
  })),

  addMaterialFolder: (name) => set((state) => ({
    materialFolders: [...state.materialFolders, { id: 'folder-' + Date.now(), name }]
  })),

  saveMaterialMeta: (id, name, category, folderId) => set((state) => ({
    savedMaterials: state.savedMaterials.map(m => 
      m.id === id ? { ...m, name, category, folderId } : m
    )
  })),

  addSavedMaterial: (material) => set((state) => ({
    savedMaterials: [
      ...state.savedMaterials,
      { id: 'mat-' + Math.random().toString(36).substr(2, 9), ...material }
    ]
  })),

  addAgendaTask: (task) => set((state) => ({
    agendaTasks: [...state.agendaTasks, { id: 'task-' + Date.now(), completed: false, ...task }]
  })),

  toggleAgendaTask: (id) => set((state) => ({
    agendaTasks: state.agendaTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  })),

  deleteAgendaTask: (id) => set((state) => ({
    agendaTasks: state.agendaTasks.filter(t => t.id !== id)
  })),

  setIsLocked: (lock) => set({ isLocked: lock }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setAutoLockTime: (minutes) => set({ autoLockTime: minutes }),

}),
{
  name: 'arispace-storage',
  // BLINDAJE: Excluir datos voluminosos de la persistencia para no saturar el
  // limite de 5MB de LocalStorage.
  partialize: (state) => ({
    ...state,
    // 1. Nunca persistir el buffer temporal de imagenes activas
    activeImages: [],
    // 2. Sanitizar allConcepts: metadata OK, Base64 grandes -> placeholder
    allConcepts: state.allConcepts
      .slice(0, 8)
      .map(c => ({
        ...c,
        imageUrl: c.imageUrl.startsWith('data:') && c.imageUrl.length > 51200
          ? '[IMAGEN_GENERADA - Regenerar para ver]'
          : c.imageUrl,
      })),
    // 3. No persistir el fondo si es un Base64 muy grande
    backgroundImage: state.backgroundImage && state.backgroundImage.startsWith('data:')
      && state.backgroundImage.length > 512000
        ? null
        : state.backgroundImage,
  }),
}
  )
);
