import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Flower2, LayoutGrid, ArrowRight } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { useGardenBeds } from '../hooks/useGardenBeds';
import { MONTHS, EVENT_TYPE_ICONS, EVENT_TYPE_LABELS } from '../types';
import type { Plant } from '../types';

interface CalEvent {
  plant: Plant;
  eventType: 'sowing' | 'planting' | 'flowering' | 'harvest';
}

function getCurrentMonthEvents(plants: Plant[]): CalEvent[] {
  const currentMonth = new Date().getMonth() + 1;
  const events: CalEvent[] = [];

  for (const plant of plants) {
    const periods = [
      { key: 'sowing' as const, period: plant.sowing },
      { key: 'planting' as const, period: plant.planting },
      { key: 'flowering' as const, period: plant.flowering },
      { key: 'harvest' as const, period: plant.harvest },
    ];

    for (const { key, period } of periods) {
      if (!period) continue;
      const inRange = period.startMonth <= period.endMonth
        ? currentMonth >= period.startMonth && currentMonth <= period.endMonth
        : currentMonth >= period.startMonth || currentMonth <= period.endMonth;
      if (inRange) events.push({ plant, eventType: key });
    }
  }
  return events;
}

const EVENT_COLORS: Record<string, string> = {
  sowing: 'bg-amber-50 border-amber-200 text-amber-800',
  planting: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  flowering: 'bg-pink-50 border-pink-200 text-pink-800',
  harvest: 'bg-orange-50 border-orange-200 text-orange-800',
};

export default function Dashboard() {
  const { selectedPlants, allPlants } = usePlants();
  const { beds, placements } = useGardenBeds();

  const currentMonth = new Date().getMonth();
  const monthEvents = useMemo(() => getCurrentMonthEvents(selectedPlants), [selectedPlants]);

  const stats = {
    totalPlants: allPlants.length,
    selectedPlants: selectedPlants.length,
    totalBeds: beds.length,
    totalPlacements: placements.length,
    flowers: allPlants.filter(p => p.type === 'flower').length,
    veggies: allPlants.filter(p => p.type === 'vegetable' || p.type === 'herb').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-500 to-peach-400 bg-clip-text text-transparent">
          Mon Jardin
        </h1>
        <p className="text-earth-muted mt-2">
          {MONTHS[currentMonth]} {new Date().getFullYear()} — {monthEvents.length} activité{monthEvents.length !== 1 ? 's' : ''} ce mois
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-rose-100">
          <p className="text-2xl font-bold text-rose-500">{stats.flowers}</p>
          <p className="text-xs text-earth-muted">Fleurs</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-emerald-100">
          <p className="text-2xl font-bold text-veggie">{stats.veggies}</p>
          <p className="text-xs text-earth-muted">Légumes & Aromates</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-rose-100">
          <p className="text-2xl font-bold text-peach-500">{stats.totalBeds}</p>
          <p className="text-xs text-earth-muted">Bacs</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-rose-100">
          <p className="text-2xl font-bold text-earth">{stats.totalPlacements}</p>
          <p className="text-xs text-earth-muted">Plantes placées</p>
        </div>
      </div>

      {/* Current month events */}
      <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-rose-100 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-earth flex items-center gap-2">
            <Calendar size={18} className="text-rose-400" />
            Ce mois-ci
          </h2>
          <Link to="/calendar" className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 no-underline">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        {monthEvents.length === 0 ? (
          <p className="text-sm text-earth-muted text-center py-4">Aucune activité ce mois</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {monthEvents.slice(0, 10).map((ev, i) => (
              <div key={i} className={`flex items-center gap-3 p-2 rounded-xl border ${EVENT_COLORS[ev.eventType]}`}>
                <span className="text-lg">{EVENT_TYPE_ICONS[ev.eventType]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ev.plant.name}</p>
                  <p className="text-xs opacity-70">{EVENT_TYPE_LABELS[ev.eventType]}</p>
                </div>
              </div>
            ))}
            {monthEvents.length > 10 && (
              <p className="text-xs text-earth-muted text-center">+ {monthEvents.length - 10} autres</p>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/plants" className="group bg-white/70 backdrop-blur rounded-2xl p-4 border border-rose-100 hover:shadow-md transition no-underline text-center">
          <Search size={24} className="mx-auto text-rose-400 mb-2 group-hover:scale-110 transition" />
          <p className="text-sm font-medium text-earth">Chercher des plantes</p>
        </Link>
        <Link to="/my-garden" className="group bg-white/70 backdrop-blur rounded-2xl p-4 border border-rose-100 hover:shadow-md transition no-underline text-center">
          <Flower2 size={24} className="mx-auto text-rose-400 mb-2 group-hover:scale-110 transition" />
          <p className="text-sm font-medium text-earth">Mon Jardin</p>
        </Link>
        <Link to="/calendar" className="group bg-white/70 backdrop-blur rounded-2xl p-4 border border-rose-100 hover:shadow-md transition no-underline text-center">
          <Calendar size={24} className="mx-auto text-rose-400 mb-2 group-hover:scale-110 transition" />
          <p className="text-sm font-medium text-earth">Calendrier</p>
        </Link>
        <Link to="/beds" className="group bg-white/70 backdrop-blur rounded-2xl p-4 border border-rose-100 hover:shadow-md transition no-underline text-center">
          <LayoutGrid size={24} className="mx-auto text-rose-400 mb-2 group-hover:scale-110 transition" />
          <p className="text-sm font-medium text-earth">Mes Bacs</p>
        </Link>
      </div>
    </div>
  );
}
