import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { GardenBed, BedPlacement } from '../types';

export function useGardenBeds() {
  const beds = useLiveQuery(() => db.gardenBeds.toArray()) || [];
  const placements = useLiveQuery(() => db.bedPlacements.toArray()) || [];

  async function addBed(bed: Omit<GardenBed, 'id'>) {
    return db.gardenBeds.add(bed as GardenBed);
  }

  async function updateBed(id: number, changes: Partial<GardenBed>) {
    return db.gardenBeds.update(id, changes);
  }

  async function deleteBed(id: number) {
    await db.bedPlacements.where('bedId').equals(id).delete();
    return db.gardenBeds.delete(id);
  }

  async function placePlant(bedId: number, plantId: number, row: number, col: number) {
    // Remove existing placement at this position
    const existing = await db.bedPlacements
      .where('[bedId+row+col]')
      .equals([bedId, row, col])
      .first();
    if (existing) await db.bedPlacements.delete(existing.id!);
    return db.bedPlacements.add({ bedId, plantId, row, col, plantedAt: new Date() });
  }

  async function removePlacement(id: number) {
    return db.bedPlacements.delete(id);
  }

  function getPlacementsForBed(bedId: number) {
    return placements.filter(p => p.bedId === bedId);
  }

  return { beds, placements, addBed, updateBed, deleteBed, placePlant, removePlacement, getPlacementsForBed };
}
