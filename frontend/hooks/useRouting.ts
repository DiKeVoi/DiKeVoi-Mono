import { useState } from 'react';
import { decode } from '@here/flexpolyline';

const HERE_API_KEY = process.env.EXPO_PUBLIC_HERE_API_KEY;

export function useRouting() {
    const [routePolyline, setRoutePolyline] = useState<any[]>([]);
    const [distanceKm, setdistanceKm] = useState<string>()
    const [durationMin, setDurationMin] = useState<number>() 
    const getRouting = async (startCoords: any, endCoords: any) => {
    const transportMode = 'scooter';
    const url = `https://router.hereapi.com/v8/routes?transportMode=${transportMode}&origin=${startCoords.latitude},${startCoords.longitude}&destination=${endCoords.latitude},${endCoords.longitude}&return=polyline,summary&apiKey=${HERE_API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const section = data.routes[0].sections[0];        
        
        setdistanceKm((section.summary.length / 1000).toFixed(2)); 
        setDurationMin(Math.round(section.summary.duration / 60));
                
        const decoded = decode(section.polyline);
        const coordinates = decoded.polyline.map(([lat, lng, _elev]: any) => ({ latitude: lat, longitude: lng }));
        setRoutePolyline(coordinates);
      }
    } catch (error) {
      setRoutePolyline([]);
    }
  };

  return { routePolyline, distanceKm, durationMin, getRouting, setRoutePolyline };
}
