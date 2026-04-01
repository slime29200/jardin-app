import type { Plant, PlantType } from '../types';

const OPENFARM_DIRECT = 'https://openfarm.cc/api/v1';
const OPENFARM_PROXY = '/api/openfarm';

interface OpenFarmCrop {
  id: string;
  attributes: {
    name: string;
    binomial_name?: string;
    description?: string;
    main_image_path?: string;
    sun_requirements?: string;
    sowing_method?: string;
    spread?: number;
    row_spacing?: number;
    height?: number;
    growing_degree_days?: number;
    tags_array?: string[];
  };
}

function guessPlantType(crop: OpenFarmCrop): PlantType {
  const name = crop.attributes.name.toLowerCase();
  const tags = (crop.attributes.tags_array || []).map(t => t.toLowerCase());
  const allText = [name, ...tags].join(' ');

  const veggieKeywords = ['tomato', 'tomate', 'carrot', 'carotte', 'lettuce', 'laitue', 'potato', 'pomme de terre', 'bean', 'haricot', 'pea', 'pois', 'onion', 'oignon', 'garlic', 'ail', 'pepper', 'poivron', 'cucumber', 'concombre', 'zucchini', 'courgette', 'eggplant', 'aubergine', 'cabbage', 'chou', 'spinach', 'épinard', 'radish', 'radis', 'leek', 'poireau', 'corn', 'maïs', 'squash', 'courge', 'celery', 'céleri', 'broccoli', 'brocoli', 'cauliflower', 'chou-fleur', 'beet', 'betterave', 'turnip', 'navet', 'artichoke', 'artichaut'];
  const herbKeywords = ['basil', 'basilic', 'thyme', 'thym', 'parsley', 'persil', 'mint', 'menthe', 'rosemary', 'romarin', 'cilantro', 'coriandre', 'dill', 'aneth', 'sage', 'sauge', 'oregano', 'origan', 'chive', 'ciboulette', 'tarragon', 'estragon', 'lavender', 'lavande'];
  const flowerKeywords = ['rose', 'tulip', 'tulipe', 'daisy', 'marguerite', 'sunflower', 'tournesol', 'lily', 'lys', 'dahlia', 'petunia', 'pétunia', 'marigold', 'souci', 'pansy', 'pensée', 'geranium', 'géranium', 'orchid', 'orchidée', 'jasmine', 'jasmin', 'violet', 'violette', 'iris', 'carnation', 'oeillet', 'chrysanthemum', 'chrysanthème', 'peony', 'pivoine', 'hydrangea', 'hortensia', 'poppy', 'coquelicot'];
  const fruitKeywords = ['strawberry', 'fraise', 'raspberry', 'framboise', 'blueberry', 'myrtille', 'grape', 'raisin', 'apple', 'pomme', 'cherry', 'cerise', 'plum', 'prune', 'pear', 'poire', 'melon', 'watermelon', 'pastèque', 'fig', 'figue', 'kiwi', 'peach', 'pêche', 'apricot', 'abricot'];

  if (herbKeywords.some(k => allText.includes(k))) return 'herb';
  if (flowerKeywords.some(k => allText.includes(k))) return 'flower';
  if (fruitKeywords.some(k => allText.includes(k))) return 'fruit';
  if (veggieKeywords.some(k => allText.includes(k))) return 'vegetable';
  return 'vegetable';
}

async function fetchWithFallback(path: string): Promise<Response> {
  // Try proxy first (works with Vite dev server)
  try {
    const res = await fetch(`${OPENFARM_PROXY}${path}`);
    if (res.ok) return res;
  } catch { /* proxy failed, try direct */ }
  // Fallback to direct (works if CORS is allowed)
  return fetch(`${OPENFARM_DIRECT}${path}`);
}

export async function searchOpenFarm(query: string): Promise<Plant[]> {
  try {
    const res = await fetchWithFallback(`/crops?filter=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    const crops: OpenFarmCrop[] = data.data || [];

    return crops.map(crop => ({
      externalId: `openfarm-${crop.id}`,
      name: crop.attributes.name,
      latinName: crop.attributes.binomial_name || undefined,
      type: guessPlantType(crop),
      description: crop.attributes.description || undefined,
      imageUrl: crop.attributes.main_image_path || undefined,
      height: crop.attributes.height ? `${crop.attributes.height} cm` : undefined,
      exposure: crop.attributes.sun_requirements || undefined,
      spacing: crop.attributes.row_spacing ? `${crop.attributes.row_spacing} cm` : undefined,
      isCustom: false,
      isSelected: false,
      createdAt: new Date(),
    }));
  } catch {
    console.warn('OpenFarm API unavailable');
    return [];
  }
}
