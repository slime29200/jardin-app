import { useState, useRef } from 'react';
import { Plus, Trash2, X, Camera, Check, Hash, Search } from 'lucide-react';
import PlantCard from '../components/PlantBank/PlantCard';
import PlantDetail from '../components/PlantBank/PlantDetail';
import { usePlants } from '../hooks/usePlants';
import type { Plant, PlantType } from '../types';
import { PLANT_TYPE_LABELS, MONTHS } from '../types';

function MonthSelector({ label, value, onChange }: { label: string; value?: { startMonth: number; endMonth: number }; onChange: (v: { startMonth: number; endMonth: number } | undefined) => void }) {
  const [enabled, setEnabled] = useState(!!value);
  return (
    <div className="mb-3">
      <label className="flex items-center gap-2 text-xs font-medium text-earth-muted mb-1">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => { setEnabled(e.target.checked); if (!e.target.checked) onChange(undefined); else onChange({ startMonth: 3, endMonth: 6 }); }}
          className="accent-rose-500"
        />
        {label}
      </label>
      {enabled && value && (
        <div className="flex gap-2 items-center">
          <select value={value.startMonth} onChange={e => onChange({ ...value, startMonth: Number(e.target.value) })} className="text-xs border border-rose-200 rounded-lg px-2 py-1 bg-white text-earth">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <span className="text-xs text-earth-muted">à</span>
          <select value={value.endMonth} onChange={e => onChange({ ...value, endMonth: Number(e.target.value) })} className="text-xs border border-rose-200 rounded-lg px-2 py-1 bg-white text-earth">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

function AddPlantForm({ onClose, onSave }: { onClose: () => void; onSave: (plant: Omit<Plant, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PlantType>('flower');
  const [position, setPosition] = useState('');
  const [description, setDescription] = useState('');
  const [imageData, setImageData] = useState<string>();
  const [height, setHeight] = useState('');
  const [exposure, setExposure] = useState('');
  const [watering, setWatering] = useState('');
  const [soil, setSoil] = useState('');
  const [notes, setNotes] = useState('');
  const [sowing, setSowing] = useState<{ startMonth: number; endMonth: number } | undefined>();
  const [planting, setPlanting] = useState<{ startMonth: number; endMonth: number } | undefined>();
  const [flowering, setFlowering] = useState<{ startMonth: number; endMonth: number } | undefined>();
  const [harvest, setHarvest] = useState<{ startMonth: number; endMonth: number } | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      type,
      position: position ? Number(position) : undefined,
      description: description || undefined,
      imageData,
      height: height || undefined,
      exposure: exposure || undefined,
      watering: watering || undefined,
      soil: soil || undefined,
      notes: notes || undefined,
      sowing, planting, flowering, harvest,
      isCustom: true,
      isSelected: true,
      createdAt: new Date(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-earth">Nouvelle plante</h2>
          <button onClick={onClose} className="p-1 hover:bg-rose-50 rounded-full transition"><X size={20} className="text-earth" /></button>
        </div>
        <div className="space-y-3">
          <div className="flex justify-center">
            <button onClick={() => fileRef.current?.click()} className="w-28 h-28 rounded-2xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center bg-peach-50 hover:bg-rose-50 transition overflow-hidden">
              {imageData ? <img src={imageData} alt="" className="w-full h-full object-cover" /> : <><Camera size={24} className="text-rose-300" /><span className="text-xs text-earth-muted mt-1">Photo</span></>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>

          <div className="flex gap-2">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom de la plante *" className="flex-1 px-3 py-2 border border-rose-200 rounded-xl text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <div className="relative w-20">
              <Hash size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-earth-muted" />
              <input type="number" min="1" value={position} onChange={e => setPosition(e.target.value)} placeholder="N°" className="w-full pl-7 pr-2 py-2 border border-rose-200 rounded-xl text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
          </div>

          <div className="flex gap-2">
            {(['flower', 'vegetable', 'herb', 'fruit'] as const).map(t => (
              <button key={t} onClick={() => setType(t)} className={`flex-1 py-1.5 rounded-full text-xs font-medium transition ${type === t ? (t === 'flower' || t === 'fruit' ? 'bg-flower-light text-rose-600' : 'bg-veggie-light text-green-700') : 'bg-peach-50 text-earth-muted hover:bg-rose-50'}`}>
                {PLANT_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={2} className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />

          <div className="grid grid-cols-2 gap-2">
            <input value={height} onChange={e => setHeight(e.target.value)} placeholder="Hauteur (ex: 60 cm)" className="px-3 py-2 border border-rose-200 rounded-xl text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <input value={exposure} onChange={e => setExposure(e.target.value)} placeholder="Exposition" className="px-3 py-2 border border-rose-200 rounded-xl text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <input value={watering} onChange={e => setWatering(e.target.value)} placeholder="Arrosage" className="px-3 py-2 border border-rose-200 rounded-xl text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <input value={soil} onChange={e => setSoil(e.target.value)} placeholder="Type de sol" className="px-3 py-2 border border-rose-200 rounded-xl text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>

          <div className="bg-peach-50 p-3 rounded-xl">
            <p className="text-xs font-semibold text-earth mb-2">Périodes</p>
            <MonthSelector label="🌱 Semis" value={sowing} onChange={setSowing} />
            <MonthSelector label="🌿 Plantation" value={planting} onChange={setPlanting} />
            <MonthSelector label="🌸 Floraison" value={flowering} onChange={setFlowering} />
            <MonthSelector label="🧺 Récolte" value={harvest} onChange={setHarvest} />
          </div>

          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes personnelles" rows={2} className="w-full px-3 py-2 border border-rose-200 rounded-xl text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />

          <button onClick={handleSave} disabled={!name.trim()} className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-peach-400 text-white rounded-full font-medium hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <Check size={18} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// Modale pour modifier le numéro d'une plante existante
function NumberModal({ plant, onClose, onSave }: { plant: Plant; onClose: () => void; onSave: (pos: number | undefined) => void }) {
  const [val, setVal] = useState(plant.position?.toString() || '');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-5 w-72" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-earth mb-3">Numéro de {plant.name}</h3>
        <div className="relative">
          <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-muted" />
          <input
            type="number" min="1"
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="Ex : 1, 2, 3..."
            className="w-full pl-9 pr-3 py-2 border border-rose-200 rounded-xl text-sm text-earth focus:outline-none focus:ring-2 focus:ring-rose-300"
            autoFocus
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => onSave(val ? Number(val) : undefined)} className="flex-1 py-2 bg-gradient-to-r from-rose-500 to-peach-400 text-white rounded-full text-sm font-medium">
            Valider
          </button>
          <button onClick={onClose} className="flex-1 py-2 bg-peach-50 text-earth rounded-full text-sm">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyGardenPage() {
  const { allPlants, addPlant, deletePlant, toggleSelected, updatePlant } = usePlants();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [numberingPlant, setNumberingPlant] = useState<Plant | null>(null);
  const [filter, setFilter] = useState<'all' | 'selected' | 'custom'>('all');
  const [search, setSearch] = useState('');

  const filtered = allPlants.filter(p => {
    if (filter === 'selected') { if (!p.isSelected) return false; }
    else if (filter === 'custom') { if (!p.isCustom) return false; }
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    // Recherche par numéro (#3 ou juste 3) ou par nom
    if (q.startsWith('#')) {
      const num = q.slice(1);
      return p.position?.toString() === num;
    }
    if (/^\d+$/.test(q)) {
      return p.position?.toString() === q || p.name.toLowerCase().includes(q);
    }
    return p.name.toLowerCase().includes(q) || p.latinName?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-earth">Mon Jardin</h1>
          <p className="text-sm text-earth-muted">{allPlants.length} plante{allPlants.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-peach-400 text-white rounded-full text-sm font-medium hover:shadow-md active:scale-95 transition-all">
          <Plus size={18} /> Ajouter
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou numéro (#3 ou 3)..."
          className="w-full pl-9 pr-4 py-2 bg-white/70 border border-rose-100 rounded-full text-sm text-earth placeholder:text-earth-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-muted hover:text-earth">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'selected', 'custom'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-medium transition ${filter === f ? 'bg-gradient-to-r from-rose-400 to-peach-300 text-white' : 'bg-white/60 border border-rose-100 text-earth hover:bg-rose-50'}`}>
            {f === 'all' ? 'Toutes' : f === 'selected' ? 'Calendrier' : 'Personnalisées'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🌱</p>
          <p className="text-earth-muted font-medium">Votre jardin est vide</p>
          <p className="text-xs text-earth-muted mt-1">Ajoutez des plantes depuis la banque ou créez les vôtres</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(plant => (
            <div key={plant.id} className="relative group">
              <PlantCard plant={plant} onSelect={setSelectedPlant} showActions={false} />

              {/* Badge numéro */}
              {plant.position !== undefined && (
                <span className="absolute top-2 left-2 bg-white/90 border border-rose-200 text-rose-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  #{plant.position}
                </span>
              )}

              {/* Actions au survol */}
              <div className="absolute bottom-[52px] left-0 right-0 px-2 flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setNumberingPlant(plant)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur text-xs text-earth-muted hover:text-rose-500 border border-rose-100"
                  title="Numéroter"
                >
                  <Hash size={12} /> N°
                </button>
                <button
                  onClick={() => toggleSelected(plant.id!)}
                  className={`p-1.5 rounded-full backdrop-blur text-xs ${plant.isSelected ? 'bg-veggie/90 text-white' : 'bg-white/80 text-earth-muted'}`}
                  title={plant.isSelected ? 'Retirer du calendrier' : 'Ajouter au calendrier'}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => deletePlant(plant.id!)}
                  className="p-1.5 rounded-full bg-white/80 backdrop-blur text-red-400 hover:text-red-600"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddPlantForm
          onClose={() => setShowAdd(false)}
          onSave={plant => { addPlant(plant); setShowAdd(false); }}
        />
      )}

      {selectedPlant && (
        <PlantDetail plant={selectedPlant} onClose={() => setSelectedPlant(null)} />
      )}

      {numberingPlant && (
        <NumberModal
          plant={numberingPlant}
          onClose={() => setNumberingPlant(null)}
          onSave={pos => { updatePlant(numberingPlant.id!, { position: pos }); setNumberingPlant(null); }}
        />
      )}
    </div>
  );
}
