import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import PlantCard from '../components/PlantBank/PlantCard';
import PlantDetail from '../components/PlantBank/PlantDetail';
import { searchPlants } from '../services/plantMerger';
import { prefetchPlantImages } from '../services/wikipediaApi';
import { usePlants } from '../hooks/usePlants';
import type { Plant, PlantType } from '../types';

export default function PlantBankPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [typeFilter, setTypeFilter] = useState<PlantType | 'all'>('all');
  const { allPlants, addFromSearch } = usePlants();

  // Charger toutes les plantes au démarrage + précharger les images en batch
  useEffect(() => {
    setLoading(true);
    searchPlants('').then(plants => {
      setResults(plants);
      setLoading(false);
      // Précharge toutes les images en 2 requêtes batch max
      prefetchPlantImages(plants.map(p => p.latinName).filter(Boolean) as string[]);
    });
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    const plants = await searchPlants(query.trim());
    setResults(plants);
    setLoading(false);
  };

  const isAdded = (plant: Plant) =>
    allPlants.some(p => p.externalId === plant.externalId);

  const filteredResults = typeFilter === 'all'
    ? results
    : results.filter(p => p.type === typeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-earth">Banque de plantes</h1>
        <p className="text-sm text-earth-muted mt-1">{results.length} plante{results.length !== 1 ? 's' : ''} disponible{results.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-2 max-w-xl mx-auto mb-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-muted" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher (tomate, rose, basilic...)"
            className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-rose-200 rounded-full text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-peach-400 text-white rounded-full text-sm font-medium hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Chercher'}
        </button>
      </div>

      {/* Filtres par type */}
      <div className="flex gap-2 justify-center mb-5 flex-wrap">
        {(['all', 'flower', 'vegetable', 'herb', 'fruit'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              typeFilter === t
                ? 'bg-gradient-to-r from-rose-400 to-peach-300 text-white shadow-sm'
                : 'bg-white/60 border border-rose-100 text-earth hover:bg-rose-50'
            }`}
          >
            {t === 'all' ? `Tout (${results.length})`
              : t === 'flower' ? `🌸 Fleurs (${results.filter(p => p.type === 'flower').length})`
              : t === 'vegetable' ? `🥬 Légumes (${results.filter(p => p.type === 'vegetable').length})`
              : t === 'herb' ? `🌿 Aromates (${results.filter(p => p.type === 'herb').length})`
              : `🍓 Fruits (${results.filter(p => p.type === 'fruit').length})`}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-rose-400" />
        </div>
      )}

      {!loading && filteredResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-earth-muted">Aucun résultat pour "{query}"</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredResults.map((plant, i) => (
          <PlantCard
            key={plant.externalId || i}
            plant={plant}
            onAdd={addFromSearch}
            onSelect={setSelectedPlant}
            isAdded={isAdded(plant)}
          />
        ))}
      </div>

      {selectedPlant && (
        <PlantDetail
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          onAdd={addFromSearch}
          isAdded={isAdded(selectedPlant)}
        />
      )}
    </div>
  );
}
