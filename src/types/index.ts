/**
 * TypeScript type definitions for Skyrim Bestiary
 * Use these types when migrating JavaScript files to TypeScript
 */

// Character stats interface
export interface CharacterStats {
  health: number;
  magicka: number;
  stamina: number;
}

// Character skill interface
export interface CharacterSkill {
  name: string;
  level: 'Novice' | 'Adept' | 'Expert' | 'Legendary';
}

// Combat ability interface
export interface CombatAbility {
  name: string;
  value: string | number;
  type: 'Physical' | 'Fire' | 'Frost' | 'Shock' | 'Poison' | 'Magic' | 'Heal';
}

// Difficulty levels
export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Deadly';

// Complete character interface
export interface Character {
  id: number;
  name: string;
  race: string;
  level: number;
  location: string;
  faction: string;
  difficulty: Difficulty;
  description: string;
  imagePath: string;
  modelPath: string;
  stats: CharacterStats;
  skills: CharacterSkill[];
  combat: CombatAbility[];
}

// Character list response
export interface CharacterList {
  characters: Character[];
}

// Filter options
export interface FilterOptions {
  race?: string;
  difficulty?: Difficulty;
  location?: string;
  faction?: string;
  minLevel?: number;
  maxLevel?: number;
}

// Sort options
export type SortBy = 'name' | 'level' | 'difficulty';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  by: SortBy;
  order: SortOrder;
}

// 3D Viewer settings
export interface ViewerSettings {
  wireframe: boolean;
  grid: boolean;
  autoRotate: boolean;
  rotationSpeed: number;
  backgroundColor: number;
  lightingIntensity: number;
}

// Export format options
export type ExportFormat = 'OBJ' | 'PLY' | 'STL' | 'GLTF' | 'FBX';

export interface ExportOptions {
  format: ExportFormat;
  quality: 'low' | 'medium' | 'high';
  includeTextures: boolean;
}

// Reconstruction settings
export interface ReconstructionSettings {
  quality: 'draft' | 'standard' | 'high';
  density: number;
  algorithm: 'poisson' | 'delaunay' | 'marching-cubes';
}

// Point cloud data
export interface PointCloudPoint {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
}

export interface PointCloudData {
  points: PointCloudPoint[];
  boundingBox?: {
    min_x: number;
    max_x: number;
    min_y: number;
    max_y: number;
    min_z: number;
    max_z: number;
  };
}

// Favorites management
export interface FavoritesManager {
  favorites: Set<number>;
  add: (id: number) => void;
  remove: (id: number) => void;
  has: (id: number) => boolean;
  toggle: (id: number) => void;
  save: () => void;
  load: () => void;
}

// Service Worker types
export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'CACHE_URLS' | 'CLEAR_CACHE' | 'CHECK_UPDATE';
  urls?: string[];
}

// PWA Install prompt
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CharacterApiResponse extends ApiResponse<Character> {}
export interface CharacterListApiResponse extends ApiResponse<Character[]> {}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Event handlers
export type CharacterSelectHandler = (character: Character) => void;
export type FilterChangeHandler = (filters: FilterOptions) => void;
export type SortChangeHandler = (sort: SortOptions) => void;
