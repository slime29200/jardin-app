import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, GripVertical } from 'lucide-react';
import { useGardenBeds } from '../hooks/useGardenBeds';
import { usePlants } from '../hooks/usePlants';
import { getWikipediaImage } from '../services/wikipediaApi';
import type { Plant, GardenBed } from '../types';

function usePlantImage(plant: Plant): string | undefined {
  const [img, setImg] = useState<string | undefined>(plant.imageData || plant.imageUrl);
  useEffect(() => {
    if (img) return;
    getWikipediaImage(plant.latinName, plant.name).then(url => { if (url) setImg(url); });
  }, [plant.latinName, plant.name]);
  return img;
}

function BedEditor({ onClose, onSave }: { onClose: () => void; onSave: (bed: Omit<GardenBed, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-earth">Nouveau bac</h2>
          <button onClick={onClose} className="p-1 hover:bg-rose-50 rounded-full transition"><X size={20} className="text-earth" /></button>
        </div>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du bac *" className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-earth-muted">Lignes</label>
              <input type="number" min={1} max={20} value={rows} onChange={e => setRows(Number(e.target.value))} className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm text-earth focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div>
              <label className="text-xs text-earth-muted">Colonnes</label>
              <input type="number" min={1} max={20} value={cols} onChange={e => setCols(Number(e.target.value))} className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm text-earth focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
          </div>
          <div className="bg-peach-50 rounded-xl p-3">
            <p className="text-xs text-earth-muted mb-2">Aperçu ({rows} x {cols})</p>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${Math.min(cols, 12)}, 1fr)` }}>
              {Array.from({ length: Math.min(rows * cols, 144) }, (_, i) => (
                <div key={i} className="aspect-square bg-white/60 rounded-sm border border-rose-100" />
              ))}
            </div>
          </div>
          <button
            onClick={() => { if (name.trim()) { onSave({ name: name.trim(), rows, cols, createdAt: new Date() }); } }}
            disabled={!name.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-peach-400 text-white rounded-full font-medium hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check size={18} /> Créer le bac
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_PLANT: Plant = { name: '', type: 'flower', isCustom: false, isSelected: false, createdAt: new Date() };

function BedCell({ plant, onClick }: { plant: Plant | null; onClick: () => void }) {
  const img = usePlantImage(plant ?? EMPTY_PLANT);
  const isFlower = plant && (plant.type === 'flower' || plant.type === 'fruit');
  return (
    <div
      onClick={onClick}
      className={`aspect-square rounded-lg border-2 cursor-pointer transition-all hover:scale-105 overflow-hidden relative ${
        plant
          ? isFlower ? 'border-rose-200 bg-flower-light/50' : 'border-emerald-200 bg-veggie-light/50'
          : 'border-dashed border-rose-100 bg-white/40 hover:bg-rose-50/50 hover:border-rose-200'
      }`}
      title={plant ? `${plant.name}${plant.position ? ` #${plant.position}` : ''} — cliquer pour retirer` : 'Cliquer pour placer une plante'}
    >
      {plant ? (
        <>
          {img ? (
            <img src={img} alt={plant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-lg">{plant.type === 'flower' ? '🌸' : plant.type === 'vegetable' ? '🥬' : plant.type === 'herb' ? '🌿' : '🍓'}</span>
            </div>
          )}
          {/* Bandeau nom + numéro */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 flex items-center justify-between gap-0.5">
            <span className="text-white text-[8px] font-medium truncate leading-tight">{plant.name}</span>
            {plant.position != null && (
              <span className="text-white/80 text-[8px] font-bold flex-shrink-0">#{plant.position}</span>
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Plus size={12} className="text-rose-200" />
        </div>
      )}
    </div>
  );
}

function BedGrid({ bed, onSelectCell }: { bed: GardenBed; onSelectCell: (row: number, col: number) => void }) {
  const { getPlacementsForBed, removePlacement } = useGardenBeds();
  const { allPlants } = usePlants();
  const placements = getPlacementsForBed(bed.id!);

  function getPlantAt(row: number, col: number) {
    const placement = placements.find(p => p.row === row && p.col === col);
    if (!placement) return null;
    const plant = allPlants.find(p => p.id === placement.plantId);
    return { placement, plant };
  }

  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${bed.cols}, 1fr)` }}>
      {Array.from({ length: bed.rows * bed.cols }, (_, idx) => {
        const row = Math.floor(idx / bed.cols);
        const col = idx % bed.cols;
        const data = getPlantAt(row, col);
        const plant = data?.plant;
        const isFlower = plant && (plant.type === 'flower' || plant.type === 'fruit');

        return (
          <BedCell
            key={idx}
            plant={plant ?? null}
            onClick={() => data ? removePlacement(data.placement.id!) : onSelectCell(row, col)}
          />
        );
      })}
    </div>
  );
}

function PlantSelectorItem({ plant, onSelect }: { plant: Plant; onSelect: (p: Plant) => void }) {
  const img = usePlantImage(plant);
  const isFlower = plant.type === 'flower' || plant.type === 'fruit';
  return (
    <button
      onClick={() => onSelect(plant)}
      className={`w-full flex items-center gap-3 p-2 rounded-xl border transition hover:shadow-sm ${
        isFlower ? 'border-rose-100 hover:bg-rose-50' : 'border-emerald-100 hover:bg-emerald-50'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 ${
        isFlower ? 'bg-flower-light' : 'bg-veggie-light'
      }`}>
        {img ? (
          <img src={img} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg">{plant.type === 'flower' ? '🌸' : plant.type === 'vegetable' ? '🥬' : plant.type === 'herb' ? '🌿' : '🍓'}</span>
        )}
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-earth">{plant.name}</p>
        {plant.latinName && <p className="text-xs text-earth-muted italic">{plant.latinName}</p>}
      </div>
    </button>
  );
}

function PlantSelector({ onSelect, onClose }: { onSelect: (plant: Plant) => void; onClose: () => void }) {
  const { selectedPlants } = usePlants();

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-xl max-w-sm w-full max-h-[70vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-earth mb-3">Choisir une plante</h3>
        {selectedPlants.length === 0 ? (
          <p className="text-sm text-earth-muted text-center py-8">Aucune plante dans Mon Jardin</p>
        ) : (
          <div className="space-y-2">
            {selectedPlants.map(plant => (
              <PlantSelectorItem key={plant.id} plant={plant} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GardenBedsPage() {
  const { beds, addBed, deleteBed, placePlant } = useGardenBeds();
  const [showEditor, setShowEditor] = useState(false);
  const [selectingFor, setSelectingFor] = useState<{ bedId: number; row: number; col: number } | null>(null);

  function handlePlacePlant(plant: Plant) {
    if (!selectingFor) return;
    placePlant(selectingFor.bedId, plant.id!, selectingFor.row, selectingFor.col);
    setSelectingFor(null);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-earth">Mes Bacs</h1>
          <p className="text-sm text-earth-muted">{beds.length} bac{beds.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-peach-400 text-white rounded-full text-sm font-medium hover:shadow-md active:scale-95 transition-all"
        >
          <Plus size={18} /> Nouveau bac
        </button>
      </div>

      {beds.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🌱</p>
          <p className="text-earth-muted font-medium">Aucun bac créé</p>
          <p className="text-xs text-earth-muted mt-1">Créez vos bacs pour y organiser vos plantations</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {beds.map(bed => (
            <div key={bed.id} className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-rose-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-earth flex items-center gap-2">
                  <GripVertical size={16} className="text-earth-muted" />
                  {bed.name}
                  <span className="text-xs text-earth-muted font-normal">({bed.rows} x {bed.cols})</span>
                </h3>
                <button
                  onClick={() => deleteBed(bed.id!)}
                  className="p-1.5 hover:bg-red-50 rounded-full transition text-red-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <BedGrid
                bed={bed}
                onSelectCell={(row, col) => setSelectingFor({ bedId: bed.id!, row, col })}
              />
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <BedEditor
          onClose={() => setShowEditor(false)}
          onSave={bed => { addBed(bed); setShowEditor(false); }}
        />
      )}

      {selectingFor && (
        <PlantSelector
          onSelect={handlePlacePlant}
          onClose={() => setSelectingFor(null)}
        />
      )}
    </div>
  );
}
