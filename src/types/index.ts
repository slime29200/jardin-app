export type PlantType = 'flower' | 'vegetable' | 'herb' | 'fruit';

export interface PlantPeriod {
  startMonth: number; // 1-12
  endMonth: number;   // 1-12
}

export interface Plant {
  id?: number;
  externalId?: string;
  name: string;
  latinName?: string;
  type: PlantType;
  description?: string;
  imageUrl?: string;
  imageData?: string; // base64 for custom photos
  sowing?: PlantPeriod;
  planting?: PlantPeriod;
  flowering?: PlantPeriod;
  harvest?: PlantPeriod;
  height?: string;
  exposure?: string;
  watering?: string;
  soil?: string;
  spacing?: string;
  notes?: string;
  position?: number; // numéro d'identification de l'individu (ex: Rose #3)
  isCustom: boolean;
  isSelected: boolean;
  createdAt: Date;
}

export interface GardenBed {
  id?: number;
  name: string;
  rows: number;
  cols: number;
  color?: string;
  createdAt: Date;
}

export interface BedPlacement {
  id?: number;
  bedId: number;
  plantId: number;
  row: number;
  col: number;
  plantedAt: Date;
}

export interface CalendarEvent {
  id?: number;
  plantId: number;
  plantName: string;
  plantType: PlantType;
  eventType: 'sowing' | 'planting' | 'flowering' | 'harvest';
  month: number;
}

export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const PLANT_TYPE_LABELS: Record<PlantType, string> = {
  flower: 'Fleur',
  vegetable: 'Légume',
  herb: 'Aromate',
  fruit: 'Fruit',
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  sowing: 'Semis',
  planting: 'Plantation',
  flowering: 'Floraison',
  harvest: 'Récolte',
};

export const EVENT_TYPE_ICONS: Record<string, string> = {
  sowing: '🌱',
  planting: '🌿',
  flowering: '🌸',
  harvest: '🧺',
};
