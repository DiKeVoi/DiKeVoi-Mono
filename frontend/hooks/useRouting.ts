// filepath: frontend/hooks/useRouteCalculation.ts
import { useState } from 'react';
import { PresetLocation } from './useSearchPlaces';

const HERE_API_KEY = process.env.EXPO_PUBLIC_HERE_API_KEY;

export interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  distanceText: string;
  durationText: string;
}

export function useRouting() {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async (origin: PresetLocation, destination: PresetLocation) => {
    if (!origin || !destination) {
      setRouteInfo(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `https://router.hereapi.com/v8/routes?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&transportMode=car&return=summary&apiKey=${HERE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0 && data.routes[0].sections) {
        const section = data.routes[0].sections[0];
        const summary = section.summary;

        const distanceKm = summary.length / 1000;
        const durationMin = Math.round(summary.duration / 60);

        let distanceText: string;
        if (distanceKm >= 1) {
          distanceText = `${distanceKm.toFixed(1)} km`;
        } else {
          distanceText = `${Math.round(summary.length)} m`;
        }

        let durationText: string;
        if (durationMin >= 60) {
          const hours = Math.floor(durationMin / 60);
          const mins = durationMin % 60;
          durationText = `${hours} giờ ${mins} phút`;
        } else {
          durationText = `${durationMin} phút`;
        }

        setRouteInfo({
          distance: summary.length,
          duration: summary.duration,
          distanceText,
          durationText,
        });
      } else {
        setError('Không tìm thấy tuyến đường');
        setRouteInfo(null);
      }
    } catch (err) {
      setError('Lỗi khi tính khoảng cách');
      setRouteInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setRouteInfo(null);
    setError(null);
  };

  return { routeInfo, loading, error, calculateRoute, clearRoute };
}