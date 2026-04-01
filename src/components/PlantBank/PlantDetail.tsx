import { useState, useEffect } from 'react';
import { X, Plus, Check, Droplets, Sun, Ruler, TreeDeciduous, Sprout } from 'lucide-react';
import type { Plant } from '../../types';
import { PLANT_TYPE_LABELS, MONTHS } from '../../types';
import { getWikipediaImage } from '../../services/wikipediaApi';

interface Props {
  plant: Plant;
  onClose: () => void;
  onAdd?: (plant: Plant) => void;
  isAdded?: boolean;
}

function PeriodBar({ period, color, label }: { period?: { startMonth: number; endMonth: number }; color: string; label: string }) {
  if (!period) return null;
  return (
    <div className="mb-2">
      <p className="text-xs font-medium text-earth-muted mb-1">{label}</p>
      <div className="flex gap-0.5">
        {Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const inRange = period.startMonth <= period.endMonth
            ? month >= period.startMonth && month <= period.endMonth
            : month >= period.startMonth || month <= period.endMonth;
          return (
            <div
              key={i}
              className={`flex-1 h-5 rounded-sm text-[9px] flex items-center justify-center font-medium ${
                inRange ? color : 'bg-peach-50 text-earth-muted/50'
              }`}
              title={MONTHS[i]}
            >
              {MONTHS[i].charAt(0)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlantDetail({ plant, onClose, onAdd, isAdded }: Props) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(plant.imageData || plant.imageUrl);
  const typeColor = plant.type === 'flower' || plant.type === 'fruit' ? 'flower' : 'veggie';

  useEffect(() => {
    if (imgSrc) return;
    getWikipediaImage(plant.latinName, plant.name).then(url => {
      if (url) setImgSrc(url);
    });
  }, [plant.latinName, plant.name]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative aspect-video bg-gradient-to-br from-peach-50 to-rose-50 rounded-t-3xl overflow-hidden">
          {imgSrc ? (
            <img src={imgSrc} alt={plant.name} className="w-full h-full object-cover" onError={() => setImgSrc(undefined)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">
              {plant.type === 'flower' ? '🌸' : plant.type === 'vegetable' ? '🥬' : plant.type === 'herb' ? '🌿' : '🍓'}
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/80 backdrop-blur rounded-full p-1.5 hover:bg-white transition">
            <X size={20} className="text-earth" />
          </button>
          <span className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${
            typeColor === 'flower' ? 'bg-flower-light text-rose-600' : 'bg-veggie-light text-green-700'
          }`}>
            {PLANT_TYPE_LABELS[plant.type]}
          </span>
        </div>

        <div className="p-5">
          <h2 className="text-xl font-bold text-earth">{plant.name}</h2>
          {plant.latinName && <p className="text-sm italic text-earth-muted mt-0.5">{plant.latinName}</p>}

          {plant.description && (
            <p className="mt-3 text-sm text-earth-muted leading-relaxed">{plant.description}</p>
          )}

          <div className="grid grid-cols-2 gap-2 mt-4">
            {plant.exposure && (
              <div className="flex items-center gap-2 p-2 bg-peach-50 rounded-xl">
                <Sun size={16} className="text-seed" />
                <div>
                  <p className="text-[10px] text-earth-muted">Exposition</p>
                  <p className="text-xs font-medium text-earth">{plant.exposure}</p>
                </div>
              </div>
            )}
            {plant.watering && (
              <div className="flex items-center gap-2 p-2 bg-peach-50 rounded-xl">
                <Droplets size={16} className="text-blue-400" />
                <div>
                  <p className="text-[10px] text-earth-muted">Arrosage</p>
                  <p className="text-xs font-medium text-earth">{plant.watering}</p>
                </div>
              </div>
            )}
            {plant.height && (
              <div className="flex items-center gap-2 p-2 bg-peach-50 rounded-xl">
                <Ruler size={16} className="text-earth-muted" />
                <div>
                  <p className="text-[10px] text-earth-muted">Hauteur</p>
                  <p className="text-xs font-medium text-earth">{plant.height}</p>
                </div>
              </div>
            )}
            {plant.soil && (
              <div className="flex items-center gap-2 p-2 bg-peach-50 rounded-xl">
                <TreeDeciduous size={16} className="text-veggie" />
                <div>
                  <p className="text-[10px] text-earth-muted">Sol</p>
                  <p className="text-xs font-medium text-earth">{plant.soil}</p>
                </div>
              </div>
            )}
            {plant.spacing && (
              <div className="flex items-center gap-2 p-2 bg-peach-50 rounded-xl">
                <Sprout size={16} className="text-sprout" />
                <div>
                  <p className="text-[10px] text-earth-muted">Espacement</p>
                  <p className="text-xs font-medium text-earth">{plant.spacing}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-earth mb-2">Calendrier</h3>
            <PeriodBar period={plant.sowing} color="bg-seed/20 text-amber-700" label="🌱 Semis" />
            <PeriodBar period={plant.planting} color="bg-sprout/20 text-green-700" label="🌿 Plantation" />
            <PeriodBar period={plant.flowering} color="bg-bloom/20 text-rose-700" label="🌸 Floraison" />
            <PeriodBar period={plant.harvest} color="bg-harvest/20 text-orange-700" label="🧺 Récolte" />
          </div>

          {plant.notes && (
            <div className="mt-4 p-3 bg-peach-50 rounded-xl">
              <p className="text-xs font-medium text-earth-muted mb-1">Notes</p>
              <p className="text-sm text-earth">{plant.notes}</p>
            </div>
          )}

          {onAdd && (
            <button
              onClick={() => onAdd(plant)}
              disabled={isAdded}
              className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
                isAdded
                  ? 'bg-veggie-light text-green-700 cursor-default'
                  : 'bg-gradient-to-r from-rose-500 to-peach-400 text-white hover:shadow-lg active:scale-95'
              }`}
            >
              {isAdded ? <><Check size={18} /> Déjà dans mon jardin</> : <><Plus size={18} /> Ajouter à mon jardin</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
