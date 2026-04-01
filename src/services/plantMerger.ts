import type { Plant } from '../types';
import { searchLocalPlants } from '../data/plantsDatabase';

export async function searchPlants(query: string): Promise<Plant[]> {
  const results = searchLocalPlants(query);
  return results.map(p => ({
    ...p,
    isCustom: false,
    isSelected: false,
    createdAt: new Date(),
  }));
}
