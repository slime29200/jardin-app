// Wikipedia API - batch queries (50 plantes par requête = pas de rate limit)

const STORAGE_KEY = 'wiki_img_cache_v3';

function loadCache(): Map<string, string | null> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Map(Object.entries(JSON.parse(stored)));
  } catch { /* ignore */ }
  return new Map();
}
const cache = loadCache();

function persistCache() {
  try {
    const obj: Record<string, string | null> = {};
    cache.forEach((v, k) => { obj[k] = v; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch { /* ignore */ }
}

// Titres Wikipedia exacts (en anglais) pour chaque nom latin
const WIKI_TITLES: Record<string, string> = {
  'Rosa': 'Rose',
  'Tulipa': 'Tulip',
  'Lavandula angustifolia': 'Lavandula angustifolia',
  'Dahlia': 'Dahlia',
  'Helianthus annuus': 'Sunflower',
  'Leucanthemum vulgare': 'Leucanthemum vulgare',
  'Viola tricolor': 'Viola tricolor',
  'Petunia': 'Petunia',
  'Pelargonium': 'Pelargonium',
  'Paeonia': 'Peony',
  'Antirrhinum majus': 'Antirrhinum',
  'Tropaeolum majus': 'Tropaeolum majus',
  'Calendula officinalis': 'Calendula officinalis',
  'Papaver rhoeas': 'Papaver rhoeas',
  'Cosmos bipinnatus': 'Cosmos (plant)',
  'Zinnia elegans': 'Zinnia',
  'Gerbera jamesonii': 'Gerbera jamesonii',
  'Rudbeckia hirta': 'Rudbeckia hirta',
  'Echinacea purpurea': 'Echinacea purpurea',
  'Digitalis purpurea': 'Digitalis purpurea',
  'Lupinus polyphyllus': 'Lupinus polyphyllus',
  'Phlox paniculata': 'Phlox paniculata',
  'Hibiscus syriacus': 'Hibiscus syriacus',
  'Clematis': 'Clematis',
  'Jasminum officinale': 'Jasminum officinale',
  'Begonia': 'Begonia',
  'Anemone coronaria': 'Anemone coronaria',
  'Freesia': 'Freesia',
  'Hyacinthus orientalis': 'Hyacinthus orientalis',
  'Narcissus': 'Narcissus (plant)',
  'Lilium': 'Lily',
  'Aster': 'Aster (genus)',
  'Campanula': 'Campanula',
  'Gladiolus': 'Gladiolus',
  'Impatiens walleriana': 'Impatiens walleriana',
  'Iris germanica': 'Iris germanica',
  'Hydrangea macrophylla': 'Hydrangea macrophylla',
  'Solanum lycopersicum': 'Tomato',
  'Solanum lycopersicum var. cerasiforme': 'Cherry tomato',
  'Cucurbita pepo': 'Zucchini',
  'Daucus carota': 'Carrot',
  'Lactuca sativa': 'Lettuce',
  'Phaseolus vulgaris': 'Common bean',
  'Capsicum annuum': 'Bell pepper',
  'Capsicum frutescens': 'Capsicum frutescens',
  'Cucumis sativus': 'Cucumber',
  'Allium cepa': 'Onion',
  'Allium sativum': 'Garlic',
  'Allium porrum': 'Leek',
  'Beta vulgaris': 'Beetroot',
  'Raphanus sativus': 'Radish',
  'Spinacia oleracea': 'Spinach',
  'Brassica oleracea italica': 'Broccoli',
  'Brassica oleracea botrytis': 'Cauliflower',
  'Solanum melongena': 'Eggplant',
  'Pisum sativum': 'Pea',
  'Solanum tuberosum': 'Potato',
  'Cucurbita maxima': 'Cucurbita maxima',
  'Zea mays': 'Maize',
  'Cynara cardunculus': 'Artichoke',
  'Asparagus officinalis': 'Asparagus',
  'Foeniculum vulgare': 'Fennel',
  'Apium graveolens': 'Celery',
  'Brassica rapa': 'Turnip',
  'Eruca vesicaria': 'Arugula',
  'Beta vulgaris subsp. cicla': 'Chard',
  'Ocimum basilicum': 'Basil',
  'Mentha': 'Mentha',
  'Petroselinum crispum': 'Parsley',
  'Allium schoenoprasum': 'Chives',
  'Thymus vulgaris': 'Thyme',
  'Salvia rosmarinus': 'Rosemary',
  'Salvia officinalis': 'Salvia officinalis',
  'Coriandrum sativum': 'Coriander',
  'Anethum graveolens': 'Dill',
  'Origanum vulgare': 'Oregano',
  'Artemisia dracunculus': 'Tarragon',
  'Matricaria chamomilla': 'Matricaria chamomilla',
  'Melissa officinalis': 'Melissa officinalis',
  'Borago officinalis': 'Borage',
  'Aloysia citrodora': 'Lemon verbena',
  'Fragaria × ananassa': 'Strawberry',
  'Rubus idaeus': 'Raspberry',
  'Ribes nigrum': 'Blackcurrant',
  'Ribes rubrum': 'Redcurrant',
  'Cucumis melo': 'Melon',
  'Rheum rhabarbarum': 'Rhubarb',
  'Vaccinium corymbosum': 'Highbush blueberry',
};

// Découpe un tableau en sous-tableaux de taille n
function chunks<T>(arr: T[], n: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n));
  return result;
}

// Fetch une batch de titres Wikipedia (jusqu'à 50 à la fois)
async function fetchBatch(titles: string[]): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  if (titles.length === 0) return result;
  try {
    const joined = titles.map(t => t.replace(/ /g, '_')).join('|');
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(joined)}&prop=pageimages&format=json&pithumbsize=400&redirects=1&origin=*`;
    const res = await fetch(url, {
      headers: { 'Api-User-Agent': 'MonJardinApp/1.0 (garden-planner)' }
    });
    if (!res.ok) return result;
    const data = await res.json();

    // Construire la chaîne de redirections: titre demandé → titre final
    const chain: Record<string, string> = {};
    for (const n of (data.query?.normalized || []) as Array<{ from: string; to: string }>) {
      chain[n.from] = n.to;
    }
    for (const r of (data.query?.redirects || []) as Array<{ from: string; to: string }>) {
      // Mettre à jour tous les entrées qui pointaient vers ce titre
      for (const key of Object.keys(chain)) {
        if (chain[key] === r.from) chain[key] = r.to;
      }
      chain[r.from] = r.to;
    }

    // Map titre final → thumbnail
    const pageMap: Record<string, string | null> = {};
    for (const page of Object.values(data.query?.pages || {}) as Array<{ title: string; thumbnail?: { source: string } }>) {
      pageMap[page.title] = page.thumbnail?.source || null;
    }

    // Résoudre chaque titre demandé → titre final → thumbnail
    for (const title of titles) {
      let resolved = title.replace(/_/g, ' ');
      // Suivre la chaîne (max 5 sauts pour éviter les boucles)
      for (let i = 0; i < 5; i++) {
        const next = chain[resolved] || chain[resolved.replace(/ /g, '_')];
        if (!next || next === resolved) break;
        resolved = next;
      }
      result[title] = pageMap[resolved] ?? pageMap[resolved.replace(/ /g, '_')] ?? null;
    }
  } catch { /* ignore */ }
  return result;
}

// Précharge toutes les images en 2 requêtes batch (≤50 titres chacune)
let prefetchPromise: Promise<void> | null = null;

function prefetchAll(latinNames: string[]) {
  if (prefetchPromise) return;
  prefetchPromise = (async () => {
    const toFetch = latinNames
      .map(n => ({ key: n, title: WIKI_TITLES[n] || n }))
      .filter(({ key }) => !cache.has(key));

    if (toFetch.length === 0) return;

    const titlesChunked = chunks(toFetch, 50);
    for (const chunk of titlesChunked) {
      const titles = chunk.map(x => x.title);
      const batchResult = await fetchBatch(titles);
      for (const { key, title } of chunk) {
        const img = batchResult[title] ?? null;
        cache.set(key, img);
      }
      // Petit délai entre les batches
      if (titlesChunked.length > 1) await new Promise(r => setTimeout(r, 500));
    }
    persistCache();
  })();
}

// API publique : retourne l'image pour une plante
// (déclenche le préchargement de toutes les plantes si pas encore fait)
export async function getWikipediaImage(latinName?: string, commonName?: string): Promise<string | null> {
  const cacheKey = latinName || commonName || '';
  if (!cacheKey) return null;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;
  // Attendre que le prefetch soit terminé (s'il est en cours)
  if (prefetchPromise) await prefetchPromise;
  return cache.get(cacheKey) ?? null;
}

// Précharge en avance toutes les plantes connues
export function prefetchPlantImages(latinNames: string[]) {
  prefetchAll(latinNames);
}
