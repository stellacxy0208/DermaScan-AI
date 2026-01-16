export enum AnalysisMode {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  imageUrl: string;
  timestamp: number;
}

export interface ViewDefinition {
  id: string;
  title: string;
  description: string;
  color: string;
}

export const VIEW_DEFINITIONS: ViewDefinition[] = [
  {
    id: 'brown',
    title: 'Brown Spots',
    description: 'Pigmentation & Melanin',
    color: 'text-amber-700'
  },
  {
    id: 'red',
    title: 'Red Areas',
    description: 'Vascular & Inflammation',
    color: 'text-red-600'
  },
  {
    id: 'uv',
    title: 'UV Spots',
    description: 'Deep Sun Damage',
    color: 'text-gray-800'
  },
  {
    id: 'wood',
    title: "Wood's Light",
    description: 'Porphyrins & Bacteria',
    color: 'text-violet-600'
  },
  {
    id: 'wrinkles',
    title: 'Wrinkles',
    description: 'Polarized Texture & Lines',
    color: 'text-emerald-600'
  },
  {
    id: 'pores',
    title: 'Pores',
    description: 'Surface Topography',
    color: 'text-fuchsia-600'
  }
];