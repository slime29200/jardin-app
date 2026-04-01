import { useState, useEffect, useRef } from 'react';
import { Plus, Check } from 'lucide-react';
import type { Plant } from '../../types';
import { PLANT_TYPE_LABELS } from '../../types';
import { getWikipediaImage } from '../../services/wikipediaApi';

interface Props {
  plant: Plant;
  onAdd?: (plant: Plant) => void;
  onSelect?: (plant: Plant) => void;
  isAdded?: boolean;
  showActions?: boolean;
}

const FALLBACK_EMOJI: Record<string, string> = {
  flower: '🌸', vegetable: '🥬', herb: '🌿', fruit: '🍓',
};

export default function PlantCard({ plant, onAdd, onSelect, isAdded, showActions = true }: Props) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(plant.imageData || plant.imageUrl);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const typeColor = plant.type === 'flower' || plant.type === 'fruit' ? 'flower' : 'veggie';

  // Déclenche le chargement seulement quand la carte entre dans le viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || imgSrc) return;
    getWikipediaImage(plant.latinName, plant.name).then(url => {
      if (url) setImgSrc(url);
    });
  }, [visible, plant.latinName, plant.name]);

  return (
    <div
      ref={cardRef}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-rose-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onSelect?.(plant)}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-peach-50 to-rose-50 overflow-hidden relative">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={plant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={() => setImgSrc(undefined)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {FALLBACK_EMOJI[plant.type]}
          </div>
        )}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
          typeColor === 'flower' ? 'bg-flower-light text-rose-600' : 'bg-veggie-light text-green-700'
        }`}>
          {PLANT_TYPE_LABELS[plant.type]}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-earth text-sm truncate">{plant.name}</h3>
        {plant.latinName && (
          <p className="text-xs text-earth-muted italic truncate">{plant.latinName}</p>
        )}
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {plant.exposure && (
            <span className="text-xs px-2 py-0.5 bg-peach-50 rounded-full text-earth-muted truncate max-w-full">
              ☀️ {plant.exposure.split(',')[0]}
            </span>
          )}
          {plant.height && (
            <span className="text-xs px-2 py-0.5 bg-peach-50 rounded-full text-earth-muted">
              📏 {plant.height}
            </span>
          )}
        </div>
        {showActions && onAdd && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(plant); }}
            className={`mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isAdded
                ? 'bg-veggie-light text-green-700 cursor-default'
                : 'bg-gradient-to-r from-rose-400 to-peach-300 text-white hover:shadow-md active:scale-95'
            }`}
            disabled={isAdded}
          >
            {isAdded ? <><Check size={14} /> Ajoutée</> : <><Plus size={14} /> Ajouter</>}
          </button>
        )}
      </div>
    </div>
  );
}
