import { useState } from 'react';

export interface PresetLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  { id: '1', name: 'KTX Khu B - KTX ĐHQG-HCM', latitude: 10.88227291846278, longitude: 106.78251731024706 },
  { id: '2', name: 'KTX Khu A - KTX ĐHQG-HCM', latitude: 10.878593978514703, longitude: 106.80624757972926 },
  { id: '3', name: 'Trường Đại học Bách Khoa', latitude: 10.880800816303651, longitude: 106.80538629507184 },
  { id: '4', name: 'Trường Đại học Quốc tế', latitude: 10.87769830201428, longitude: 106.80163551884073 },
  { id: '5', name: 'Trường Đại học Khoa học Tự nhiên', latitude: 10.875380586247166, longitude: 106.79817818591536 },
  { id: '6', name: 'Trường Đại học Khoa học Xã hội và Nhân văn', latitude: 10.872149263283971, longitude: 106.80202195021783 },
  { id: '7', name: 'Trường Đại học Công nghệ thông tin', latitude: 10.870188006924515, longitude: 106.80306482390714 },
  { id: '8', name: 'Trường Đại học Kinh tế - Luật', latitude: 10.870685897171269, longitude: 106.77831009507169 },
  { id: '9', name: 'Trường Đại học Nông lâm', latitude: 10.871413361026443, longitude: 106.79168659322222 },
  { id: '10', name: 'Trường Đại học Khoa học sức khoẻ', latitude: 10.888608752691626, longitude: 106.79822225089362 },
  { id: '11', name: 'Nhà văn hoá sinh viên', latitude: 10.875331376138526, longitude: 106.8007662104674 },
  { id: '12', name: 'Thư viện trung tâm ĐHQG-HCM', latitude: 10.869980934366454, longitude: 106.79618496623596 },
  { id: '13', name: 'Trung tâm Giáo dục Quốc Phòng', latitude: 10.88823442058416, longitude: 106.80472638392436 },
  { id: '14', name: 'Go! Dĩ An', latitude: 10.889110417205243, longitude: 106.77583425287442 },
  { id: '15', name: 'Suối Tiên', latitude: 10.866428627993763, longitude: 106.80318925274291 },


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