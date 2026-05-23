<<<<<<< HEAD
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
=======
import { renderHook, act } from '@testing-library/react-native';
import { useRouting } from '../../hooks/useRouting';
import type { PresetLocation } from '../../hooks/useSearchPlaces';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const origin: PresetLocation = {
  id: '1',
  name: 'KTX Khu B - KTX ĐHQG-HCM',
  latitude: 10.88227291846278,
  longitude: 106.78251731024706,
};

const destination: PresetLocation = {
  id: '2',
  name: 'KTX Khu A - KTX ĐHQG-HCM',
  latitude: 10.878593978514703,
  longitude: 106.80624757972926,
};

/** Build a HERE-style route response with the given length (m) and duration (s). */
function makeRouteResponse(length: number, duration: number) {
  return {
    routes: [
      {
        sections: [
          {
            summary: { length, duration },
          },
        ],
      },
    ],
  };
}

function mockSuccess(length: number, duration: number) {
  mockFetch.mockResolvedValue({
    json: jest.fn().mockResolvedValue(makeRouteResponse(length, duration)),
  });
}

describe('useRouting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------
  describe('initial state', () => {
    it('routeInfo starts as null', () => {
      const { result } = renderHook(() => useRouting());
      expect(result.current.routeInfo).toBeNull();
    });

    it('loading starts as false', () => {
      const { result } = renderHook(() => useRouting());
      expect(result.current.loading).toBe(false);
    });

    it('error starts as null', () => {
      const { result } = renderHook(() => useRouting());
      expect(result.current.error).toBeNull();
    });

    it('exposes calculateRoute as a function', () => {
      const { result } = renderHook(() => useRouting());
      expect(typeof result.current.calculateRoute).toBe('function');
    });

    it('exposes clearRoute as a function', () => {
      const { result } = renderHook(() => useRouting());
      expect(typeof result.current.clearRoute).toBe('function');
    });
  });

  // ---------------------------------------------------------------------------
  // calculateRoute – happy path
  // ---------------------------------------------------------------------------
  describe('calculateRoute – success', () => {
    it('sets routeInfo with distance and duration fields', async () => {
      mockSuccess(5432, 1260);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.routeInfo).not.toBeNull();
      expect(result.current.routeInfo).toMatchObject({
        distance: 5432,
        duration: 1260,
      });
    });

    it('loading is false after successful call', async () => {
      mockSuccess(5432, 1260);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.loading).toBe(false);
    });

    it('error remains null after successful call', async () => {
      mockSuccess(5432, 1260);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.error).toBeNull();
    });

    it('calls fetch with origin/destination coords and car transport mode', async () => {
      mockSuccess(5432, 1260);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('https://router.hereapi.com/v8/routes');
      expect(url).toContain(`origin=${origin.latitude},${origin.longitude}`);
      expect(url).toContain(`destination=${destination.latitude},${destination.longitude}`);
      expect(url).toContain('transportMode=car');
      expect(url).toContain('return=summary');
    });
  });

  // ---------------------------------------------------------------------------
  // Distance text formatting
  // ---------------------------------------------------------------------------
  describe('distanceText formatting', () => {
    it('formats distance >= 1 km as "X.X km"', async () => {
      mockSuccess(5432, 60);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      // 5432 m -> 5.4 km
      expect(result.current.routeInfo?.distanceText).toBe('5.4 km');
    });

    it('formats distance exactly 1000 m as "1.0 km"', async () => {
      mockSuccess(1000, 60);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.routeInfo?.distanceText).toBe('1.0 km');
    });

    it('formats distance < 1 km as "X m"', async () => {
      mockSuccess(750, 60);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.routeInfo?.distanceText).toBe('750 m');
    });

    it('formats distance 999 m as "999 m"', async () => {
      mockSuccess(999, 60);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.routeInfo?.distanceText).toBe('999 m');
    });
  });

  // ---------------------------------------------------------------------------
  // Duration text formatting
  // ---------------------------------------------------------------------------
  describe('durationText formatting', () => {
    it('formats duration < 60 min as "X phút"', async () => {
      // 21 minutes = 1260 seconds
      mockSuccess(5000, 1260);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.routeInfo?.durationText).toBe('21 phút');
    });

    it('formats duration exactly 59 min as "59 phút"', async () => {
      mockSuccess(5000, 59 * 60);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.routeInfo?.durationText).toBe('59 phút');
    });

    it('formats duration >= 60 min as "X giờ Y phút"', async () => {
      // 90 minutes = 5400 seconds
      mockSuccess(5000, 5400);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.routeInfo?.durationText).toBe('1 giờ 30 phút');
    });

    it('formats duration of exactly 120 min as "2 giờ 0 phút"', async () => {
      mockSuccess(5000, 120 * 60);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.routeInfo?.durationText).toBe('2 giờ 0 phút');
    });
  });

  // ---------------------------------------------------------------------------
  // calculateRoute – empty / missing routes in response
  // ---------------------------------------------------------------------------
  describe('calculateRoute – empty routes response', () => {
    it('sets error when routes array is empty', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ routes: [] }),
      });
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.error).toBe('Không tìm thấy tuyến đường');
      expect(result.current.routeInfo).toBeNull();
    });

    it('sets error when routes key is missing', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({}),
      });
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.error).toBe('Không tìm thấy tuyến đường');
      expect(result.current.routeInfo).toBeNull();
    });

    it('loading returns to false after empty routes response', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ routes: [] }),
      });
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // calculateRoute – fetch error
  // ---------------------------------------------------------------------------
  describe('calculateRoute – fetch error', () => {
    it('sets error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.error).toBe('Lỗi khi tính khoảng cách');
      expect(result.current.routeInfo).toBeNull();
    });

    it('sets error when json() rejects', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      });
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.error).toBe('Lỗi khi tính khoảng cách');
      expect(result.current.routeInfo).toBeNull();
    });

    it('loading returns to false after fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // calculateRoute – null/missing arguments
  // ---------------------------------------------------------------------------
  describe('calculateRoute – null arguments', () => {
    it('does not fetch and clears routeInfo when origin is falsy', async () => {
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(null as any, destination);
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.routeInfo).toBeNull();
    });

    it('does not fetch and clears routeInfo when destination is falsy', async () => {
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, null as any);
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.routeInfo).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // clearRoute
  // ---------------------------------------------------------------------------
  describe('clearRoute', () => {
    it('resets routeInfo to null', async () => {
      mockSuccess(5000, 300);
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.routeInfo).not.toBeNull();

      act(() => {
        result.current.clearRoute();
      });

      expect(result.current.routeInfo).toBeNull();
    });

    it('resets error to null', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useRouting());

      await act(async () => {
        await result.current.calculateRoute(origin, destination);
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearRoute();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
>>>>>>> d4c01fa8adf7a584a99259b4f5b57cc8f9dacc52
