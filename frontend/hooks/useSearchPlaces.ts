// filepath: frontend/hooks/usePresetLocations.ts
import { useState } from 'react';

export interface PresetLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  { id: '1', name: 'Trường Đại học Bách Khoa', latitude: 10.880800816303651, longitude: 106.80538629507184 },
  { id: '2', name: 'Trường Đại học Khoa học Tự nhiên', latitude: 10.870475, longitude: 106.802692 },
  { id: '3', name: 'Trường Đại học Công nghệ TP.HCM', latitude: 10.853047, longitude: 106.628387 },
  { id: '4', name: 'Trường Đại học Y dược TP.HCM', latitude: 10.961547, longitude: 106.682692 },
  { id: '5', name: 'Trường Đại học Luật TP.HCM', latitude: 10.776047, longitude: 106.688692 },
  { id: '6', name: 'Bến xe Miền Đông', latitude: 10.816047, longitude: 106.712692 },
];

export function useSearchPlaces() {
  const [locations] = useState<PresetLocation[]>(PRESET_LOCATIONS);

  const getLocationById = (id: string): PresetLocation | undefined => {
    return locations.find(loc => loc.id === id);
  };

  const getLocationByName = (name: string): PresetLocation | undefined => {
    return locations.find(loc => loc.name.toLowerCase() === name.toLowerCase());
  };

  return { locations, getLocationById, getLocationByName };
}