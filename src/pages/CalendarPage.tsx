import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Filter, Eye, EyeOff } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import type { Plant } from '../types';
import { MONTHS, EVENT_TYPE_ICONS, EVENT_TYPE_LABELS } from '../types';

interface CalEvent {
  plant: Plant;
  eventType: 'sowing' | 'planting' | 'flowering' | 'harvest';
  month: number;
}

const EVENT_COLORS: Record<string, string> = {
  sowing: 'bg-amber-100 text-amber-800 border-amber-200',
  planting: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  flowering: 'bg-pink-100 text-pink-800 border-pink-200',
  harvest: 'bg-orange-100 text-orange-800 border-orange-200',
};

function getEventsForPlant(plant: Plant): CalEvent[] {
  const events: CalEvent[] = [];
  const periods = [
    { key: 'sowing' as const, period: plant.sowing },
    { key: 'planting' as const, period: plant.planting },
    { key: 'flowering' as const, period: plant.flowering },
    { key: 'harvest' as const, period: plant.harvest },
  ];

  for (const { key, period } of periods) {
    if (!period) continue;
    if (period.startMonth <= period.endMonth) {
      for (let m = period.startMonth; m <= period.endMonth; m++) {
        events.push({ plant, eventType: key, month: m });
      }
    } else {
      for (let m = period.startMonth; m <= 12; m++) events.push({ plant, eventType: key, month: m });
      for (let m = 1; m <= period.endMonth; m++) events.push({ plant, eventType: key, month: m });
    }
  }
  return events;
}

export default function CalendarPage() {
  const { selectedPlants } = usePlants();
  const [currentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showFilters, setShowFilters] = useState(false);
  const [hiddenPlants, setHiddenPlants] = useState<Set<number>>(new Set());
  const [hiddenEvents, setHiddenEvents] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  const allEvents = useMemo(() => {
    return selectedPlants.flatMap(getEventsForPlant);
  }, [selectedPlants]);

  const visibleEvents = useMemo(() => {
    return allEvents.filter(e =>
      !hiddenPlants.has(e.plant.id!) && !hiddenEvents.has(e.eventType)
    );
  }, [allEvents, hiddenPlants, hiddenEvents]);

  const monthEvents = useMemo(() => {
    return visibleEvents.filter(e => e.month === selectedMonth);
  }, [visibleEvents, selectedMonth]);

  function togglePlantVisibility(id: number) {
    setHiddenPlants(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleEventType(type: string) {
    setHiddenEvents(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  }

  // Group events by plant for month view
  const groupedByPlant = useMemo(() => {
    const map = new Map<number, CalEvent[]>();
    for (const ev of monthEvents) {
      const id = ev.plant.id!;
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(ev);
    }
    return map;
  }, [monthEvents]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-earth">Calendrier</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
            className="px-3 py-1.5 bg-white/60 border border-rose-100 rounded-full text-xs text-earth hover:bg-rose-50 transition"
          >
            {viewMode === 'month' ? 'Vue annuelle' : 'Vue mensuelle'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              showFilters ? 'bg-rose-500 text-white' : 'bg-white/60 border border-rose-100 text-earth hover:bg-rose-50'
            }`}
          >
            <Filter size={14} /> Filtres
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-4 border border-rose-100">
          <div className="mb-3">
            <p className="text-xs font-semibold text-earth mb-2">Types d'événements</p>
            <div className="flex gap-2 flex-wrap">
              {(['sowing', 'planting', 'flowering', 'harvest'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => toggleEventType(type)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition ${
                    hiddenEvents.has(type) ? 'bg-gray-100 text-gray-400 line-through' : EVENT_COLORS[type]
                  }`}
                >
                  {EVENT_TYPE_ICONS[type]} {EVENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-earth mb-2">Plantes ({selectedPlants.length})</p>
            <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
              {selectedPlants.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlantVisibility(p.id!)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition ${
                    hiddenPlants.has(p.id!)
                      ? 'bg-gray-100 text-gray-400'
                      : p.type === 'flower' || p.type === 'fruit'
                        ? 'bg-flower-light text-rose-600'
                        : 'bg-veggie-light text-green-700'
                  }`}
                >
                  {hiddenPlants.has(p.id!) ? <EyeOff size={12} /> : <Eye size={12} />}
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'month' ? (
        <>
          <div className="flex items-center justify-center gap-4 mb-6">
            <button onClick={() => setSelectedMonth(m => m === 1 ? 12 : m - 1)} className="p-2 hover:bg-rose-50 rounded-full transition">
              <ChevronLeft size={20} className="text-earth" />
            </button>
            <h2 className="text-lg font-semibold text-earth min-w-[160px] text-center">
              {MONTHS[selectedMonth - 1]} {currentYear}
            </h2>
            <button onClick={() => setSelectedMonth(m => m === 12 ? 1 : m + 1)} className="p-2 hover:bg-rose-50 rounded-full transition">
              <ChevronRight size={20} className="text-earth" />
            </button>
          </div>

          {monthEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">📅</p>
              <p className="text-earth-muted">Rien de prévu ce mois-ci</p>
              {selectedPlants.length === 0 && (
                <p className="text-xs text-earth-muted mt-1">Sélectionnez des plantes dans "Mon Jardin" pour voir le calendrier</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(groupedByPlant.entries()).map(([plantId, events]) => {
                const plant = events[0].plant;
                const isFlower = plant.type === 'flower' || plant.type === 'fruit';
                return (
                  <div
                    key={plantId}
                    className={`bg-white/80 backdrop-blur rounded-2xl p-4 border ${
                      isFlower ? 'border-rose-100' : 'border-emerald-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        isFlower ? 'bg-flower-light' : 'bg-veggie-light'
                      }`}>
                        {plant.imageUrl || plant.imageData ? (
                          <img src={plant.imageData || plant.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          plant.type === 'flower' ? '🌸' : plant.type === 'vegetable' ? '🥬' : plant.type === 'herb' ? '🌿' : '🍓'
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-earth">{plant.name}</p>
                        <p className="text-xs text-earth-muted italic">{plant.latinName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {events.map((ev, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${EVENT_COLORS[ev.eventType]}`}>
                          {EVENT_TYPE_ICONS[ev.eventType]} {EVENT_TYPE_LABELS[ev.eventType]}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Year view */
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-earth p-2 sticky left-0 bg-peach-50/80 backdrop-blur min-w-[120px]">Plante</th>
                {MONTHS.map((m, i) => (
                  <th key={i} className={`text-center text-[10px] font-medium p-1 min-w-[40px] ${
                    i + 1 === new Date().getMonth() + 1 ? 'text-rose-600 font-bold' : 'text-earth-muted'
                  }`}>
                    {m.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedPlants.filter(p => !hiddenPlants.has(p.id!)).map(plant => {
                const events = getEventsForPlant(plant);
                return (
                  <tr key={plant.id} className="border-t border-rose-100/50">
                    <td className="text-xs font-medium text-earth p-2 sticky left-0 bg-peach-50/80 backdrop-blur">
                      <span className="truncate block max-w-[120px]">{plant.name}</span>
                    </td>
                    {MONTHS.map((_, monthIdx) => {
                      const month = monthIdx + 1;
                      const monthEvts = events.filter(e => e.month === month && !hiddenEvents.has(e.eventType));
                      return (
                        <td key={monthIdx} className="p-0.5 text-center">
                          <div className="flex flex-col gap-0.5 items-center">
                            {monthEvts.map((ev, i) => (
                              <span key={i} className="text-[10px]" title={EVENT_TYPE_LABELS[ev.eventType]}>
                                {EVENT_TYPE_ICONS[ev.eventType]}
                              </span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {selectedPlants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-earth-muted text-sm">Sélectionnez des plantes pour voir la vue annuelle</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
