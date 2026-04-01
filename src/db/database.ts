import Dexie, { type Table } from 'dexie';
import type { Plant, GardenBed, BedPlacement } from '../types';

export class GardenDatabase extends Dexie {
  plants!: Table<Plant>;
  gardenBeds!: Table<GardenBed>;
  bedPlacements!: Table<BedPlacement>;

  constructor() {
    super('MonJardinDB');
    this.version(1).stores({
      plants: '++id, name, type, isCustom, isSelected, externalId',
      gardenBeds: '++id, name',
      bedPlacements: '++id, bedId, plantId, [bedId+row+col]',
    });
  }
}

export const db = new GardenDatabase();
