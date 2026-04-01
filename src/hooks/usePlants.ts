import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Plant } from '../types';

export function usePlants() {
  const allPlants = useLiveQuery(() => db.plants.toArray()) || [];
  const selectedPlants = useLiveQuery(() => db.plants.filter(p => !!p.isSelected).toArray()) || [];

  async function addPlant(plant: Omit<Plant, 'id'>) {
    return db.plants.add(plant as Plant);
  }

  async function updatePlant(id: number, changes: Partial<Plant>) {
    return db.plants.update(id, changes);
  }

  async function deletePlant(id: number) {
    await db.bedPlacements.where('plantId').equals(id).delete();
    return db.plants.delete(id);
  }

  async function toggleSelected(id: number) {
    const plant = await db.plants.get(id);
    if (plant) {
      return db.plants.update(id, { isSelected: !plant.isSelected });
    }
  }

  async function addFromSearch(plant: Plant) {
    const existing = await db.plants.where('externalId').equals(plant.externalId || '').first();
    if (existing) return existing.id;
    return db.plants.add({ ...plant, isSelected: true });
  }

  return { allPlants, selectedPlants, addPlant, updatePlant, deletePlant, toggleSelected, addFromSearch };
}
