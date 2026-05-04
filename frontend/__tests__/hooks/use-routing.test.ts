import { renderHook, act } from '@testing-library/react-native';
import { useRouting } from '../../hooks/useRouting';

// Mock @here/flexpolyline decode
jest.mock('@here/flexpolyline', () => ({
  decode: jest.fn((polylineStr: string) => ({
    polyline: [
      [10.762622, 106.660172, 0],
      [10.772622, 106.670172, 0],
      [10.782622, 106.680172, 0],
    ],
  })),
}));

import { decode } from '@here/flexpolyline';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const startCoords = { latitude: 10.762622, longitude: 106.660172 };
const endCoords = { latitude: 10.772622, longitude: 106.670172 };

const mockRouteResponse = {
  routes: [
    {
      sections: [
        {
          polyline: 'encoded_polyline_string',
          summary: {
            length: 5432,    // meters -> 5.43 km
            duration: 1260,  // seconds -> 21 min
          },
        },
      ],
    },
  ],
};

describe('useRouting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns empty routePolyline initially', () => {
      const { result } = renderHook(() => useRouting());
      expect(result.current.routePolyline).toEqual([]);
    });

    it('returns undefined distanceKm initially', () => {
      const { result } = renderHook(() => useRouting());
      expect(result.current.distanceKm).toBeUndefined();
    });

    it('returns undefined durationMin initially', () => {
      const { result } = renderHook(() => useRouting());
      expect(result.current.durationMin).toBeUndefined();
    });

    it('exposes getRouting function', () => {
      const { result } = renderHook(() => useRouting());
      expect(typeof result.current.getRouting).toBe('function');
    });

    it('exposes setRoutePolyline function', () => {
      const { result } = renderHook(() => useRouting());
      expect(typeof result.current.setRoutePolyline).toBe('function');
    });
  });

  describe('getRouting - success path', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockRouteResponse),
      });
    });

    it('calls fetch with the correct HERE routing URL', async () => {
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('https://router.hereapi.com/v8/routes');
      expect(calledUrl).toContain('transportMode=scooter');
      expect(calledUrl).toContain(`origin=${startCoords.latitude},${startCoords.longitude}`);
      expect(calledUrl).toContain(`destination=${endCoords.latitude},${endCoords.longitude}`);
      expect(calledUrl).toContain('return=polyline,summary');
    });

    it('sets distanceKm correctly from route summary', async () => {
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      // 5432 meters -> 5.43 km
      expect(result.current.distanceKm).toBe('5.43');
    });

    it('sets durationMin correctly from route summary', async () => {
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      // 1260 seconds -> 21 min
      expect(result.current.durationMin).toBe(21);
    });

    it('calls decode with the polyline string from route section', async () => {
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      expect(decode).toHaveBeenCalledWith('encoded_polyline_string');
    });

    it('sets routePolyline as decoded coordinates', async () => {
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      expect(result.current.routePolyline).toEqual([
        { latitude: 10.762622, longitude: 106.660172 },
        { latitude: 10.772622, longitude: 106.670172 },
        { latitude: 10.782622, longitude: 106.680172 },
      ]);
    });

    it('handles route with different distance/duration values', async () => {
      const customResponse = {
        routes: [
          {
            sections: [
              {
                polyline: 'another_polyline',
                summary: {
                  length: 1000,  // 1.00 km
                  duration: 120, // 2 min
                },
              },
            ],
          },
        ],
      };
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(customResponse),
      });

      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      expect(result.current.distanceKm).toBe('1.00');
      expect(result.current.durationMin).toBe(2);
    });
  });

  describe('getRouting - empty/no routes', () => {
    it('does nothing when routes array is empty', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ routes: [] }),
      });

      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      expect(result.current.routePolyline).toEqual([]);
      expect(result.current.distanceKm).toBeUndefined();
      expect(result.current.durationMin).toBeUndefined();
    });

    it('does nothing when routes is undefined', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({}),
      });

      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      expect(result.current.routePolyline).toEqual([]);
    });
  });

  describe('getRouting - error handling', () => {
    it('sets routePolyline to empty array on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useRouting());

      // Pre-set some polyline to verify it gets cleared
      await act(async () => {
        result.current.setRoutePolyline([{ latitude: 1, longitude: 1 }]);
      });

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      expect(result.current.routePolyline).toEqual([]);
    });

    it('sets routePolyline to empty array when json() rejects', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      });

      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      expect(result.current.routePolyline).toEqual([]);
    });
  });

  describe('setRoutePolyline', () => {
    it('allows manual update of routePolyline', async () => {
      const { result } = renderHook(() => useRouting());
      const newPolyline = [
        { latitude: 1.0, longitude: 2.0 },
        { latitude: 3.0, longitude: 4.0 },
      ];

      await act(async () => {
        result.current.setRoutePolyline(newPolyline);
      });

      expect(result.current.routePolyline).toEqual(newPolyline);
    });

    it('allows clearing routePolyline manually', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockRouteResponse),
      });

      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.getRouting(startCoords, endCoords);
      });

      expect(result.current.routePolyline.length).toBeGreaterThan(0);

      await act(async () => {
        result.current.setRoutePolyline([]);
      });

      expect(result.current.routePolyline).toEqual([]);
    });
  });
});
