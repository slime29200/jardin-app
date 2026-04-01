import type { Plant, PlantType } from '../types';

// Trefle.io requires CORS proxy in browser
// Users need to get a free API key at https://trefle.io/
const TREFLE_TOKEN = import.meta.env.VITE_TREFLE_TOKEN || '';
const BASE_URL = '/api/trefle';

interface TreflePlant {
  id: number;
  common_name: string | null;
  scientific_name: string;
  image_url: string | null;
  family_common_name: string | null;
  genus: string;
  family: string;
  synonyms?: string[];
}

interface TreflePlantDetail {
  id: number;
  common_name: string | null;
  scientific_name: string;
  image_url: string | null;
  main_species?: {
    growth?: {
      light?: number;
      atmospheric_humidity?: number;
      minimum_precipitation?: { mm?: number };
      maximum_precipitation?: { mm?: number };
      soil_humidity?: number;
      spread?: { cm?: number };
      maximum_height?: { cm?: number };
    };
    specifications?: {
      growth_form?: string;
      growth_rate?: string;
      average_height?: { cm?: number };
    };
    flower?: {
      color?: string[] | null;
    };
    foliage?: {
      color?: string[] | null;
    };
    images?: Record<string, Array<{ image_url: string }>>;
  };
}

function guessTrefleType(plant: TreflePlant): PlantType {
  const family = (plant.family || '').toLowerCase();
  const name = (plant.common_name || plant.scientific_name || '').toLowerCase();

  const veggieNames = ['tomato', 'carrot', 'lettuce', 'potato', 'bean', 'pea', 'onion', 'garlic', 'pepper', 'cucumber', 'squash', 'cabbage', 'spinach', 'radish', 'corn', 'celery', 'broccoli', 'eggplant', 'beet', 'turnip'];
  const flowerFamilies = ['rosaceae', 'asteraceae', 'orchidaceae', 'liliaceae', 'iridaceae'];
  const herbNames = ['basil', 'thyme', 'parsley', 'mint', 'rosemary', 'cilantro', 'sage', 'oregano', 'dill', 'chive', 'lavender'];

  if (herbNames.some(k => name.includes(k))) return 'herb';
  if (veggieNames.some(k => name.includes(k))) return 'vegetable';
  if (flowerFamilies.some(f => family.includes(f))) return 'flower';
  return 'flower';
}

export async function searchTrefle(query: string): Promise<Plant[]> {
  if (!TREFLE_TOKEN) return [];
  try {
    const res = await fetch(`${BASE_URL}/plants/search?q=${encodeURIComponent(query)}&token=${TREFLE_TOKEN}`);
    if (!res.ok) return [];
    const data = await res.json();
    const plants: TreflePlant[] = data.data || [];

    return plants.map(p => ({
      externalId: `trefle-${p.id}`,
      name: p.common_name || p.scientific_name,
      latinName: p.scientific_name,
      type: guessTrefleType(p),
      imageUrl: p.image_url || undefined,
      isCustom: false,
      isSelected: false,
      createdAt: new Date(),
    }));
  } catch {
    console.error('Trefle API error');
    return [];
  }
}

export async function getTrefleDetail(id: number): Promise<Partial<Plant> | null> {
  if (!TREFLE_TOKEN) return null;
  try {
    const res = await fetch(`${BASE_URL}/plants/${id}?token=${TREFLE_TOKEN}`);
    if (!res.ok) return null;
    const data = await res.json();
    const p: TreflePlantDetail = data.data;
    const growth = p.main_species?.growth;
    const specs = p.main_species?.specifications;

    return {
      height: specs?.average_height?.cm ? `${specs.average_height.cm} cm` : undefined,
      exposure: growth?.light !== undefined ? (growth.light > 7 ? 'Plein soleil' : growth.light > 4 ? 'Mi-ombre' : 'Ombre') : undefined,
      watering: growth?.soil_humidity !== undefined ? (growth.soil_humidity > 7 ? 'Abondant' : growth.soil_humidity > 4 ? 'Modéré' : 'Faible') : undefined,
    };
  } catch {
    return null;
  }
}
