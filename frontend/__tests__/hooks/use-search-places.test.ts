import { renderHook } from '@testing-library/react-native';
import { useSearchPlaces, PRESET_LOCATIONS } from '../../hooks/useSearchPlaces';

describe('useSearchPlaces', () => {
  // ---------------------------------------------------------------------------
  // Hook shape
  // ---------------------------------------------------------------------------
  describe('hook shape', () => {
    it('takes no arguments', () => {
      // Calling with no args must not throw
      expect(() => renderHook(() => useSearchPlaces())).not.toThrow();
    });

    it('returns locations array', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(Array.isArray(result.current.locations)).toBe(true);
    });

    it('exposes getLocationById as a function', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(typeof result.current.getLocationById).toBe('function');
    });

    it('exposes getLocationByName as a function', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(typeof result.current.getLocationByName).toBe('function');
    });

    it('does NOT expose searchPlaces', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect((result.current as any).searchPlaces).toBeUndefined();
    });

    it('does NOT expose searchResults', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect((result.current as any).searchResults).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // locations array
  // ---------------------------------------------------------------------------
  describe('locations', () => {
    it('has at least one item', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(result.current.locations.length).toBeGreaterThan(0);
    });

    it('contains all 15 preset locations', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(result.current.locations).toHaveLength(15);
    });

    it('each location has id, name, latitude, longitude', () => {
      const { result } = renderHook(() => useSearchPlaces());
      result.current.locations.forEach((loc) => {
        expect(typeof loc.id).toBe('string');
        expect(typeof loc.name).toBe('string');
        expect(typeof loc.latitude).toBe('number');
        expect(typeof loc.longitude).toBe('number');
      });
    });

    it('matches the exported PRESET_LOCATIONS constant', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(result.current.locations).toEqual(PRESET_LOCATIONS);
    });

    it('first location is KTX Khu B with id "1"', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(result.current.locations[0]).toMatchObject({
        id: '1',
        name: 'KTX Khu B - KTX ĐHQG-HCM',
      });
    });
  });

  // ---------------------------------------------------------------------------
  // getLocationById
  // ---------------------------------------------------------------------------
  describe('getLocationById', () => {
    it('returns the location with matching id "1"', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationById('1');
      expect(loc).toBeDefined();
      expect(loc?.id).toBe('1');
      expect(loc?.name).toBe('KTX Khu B - KTX ĐHQG-HCM');
    });

    it('returns the location with matching id "2"', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationById('2');
      expect(loc).toBeDefined();
      expect(loc?.id).toBe('2');
      expect(loc?.name).toBe('KTX Khu A - KTX ĐHQG-HCM');
    });

    it('returns the location with matching id "15"', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationById('15');
      expect(loc).toBeDefined();
      expect(loc?.id).toBe('15');
      expect(loc?.name).toBe('Suối Tiên');
    });

    it('returns undefined for a non-existent id', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(result.current.getLocationById('nonexistent')).toBeUndefined();
    });

    it('returns undefined for an empty string id', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(result.current.getLocationById('')).toBeUndefined();
    });

    it('returns undefined for id "0" (not in the list)', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(result.current.getLocationById('0')).toBeUndefined();
    });

    it('returns correct coordinates for id "1"', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationById('1');
      expect(loc?.latitude).toBeCloseTo(10.882);
      expect(loc?.longitude).toBeCloseTo(106.782);
    });
  });

  // ---------------------------------------------------------------------------
  // getLocationByName
  // ---------------------------------------------------------------------------
  describe('getLocationByName', () => {
    it('returns the location with an exact name match', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationByName('KTX Khu B - KTX ĐHQG-HCM');
      expect(loc).toBeDefined();
      expect(loc?.id).toBe('1');
    });

    it('is case-insensitive (all uppercase)', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationByName('KTX KHU B - KTX ĐHQG-HCM');
      expect(loc).toBeDefined();
      expect(loc?.id).toBe('1');
    });

    it('is case-insensitive (all lowercase)', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationByName('ktx khu b - ktx đhqg-hcm');
      expect(loc).toBeDefined();
      expect(loc?.id).toBe('1');
    });

    it('returns undefined for a non-existent name', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(result.current.getLocationByName('nonexistent place')).toBeUndefined();
    });

    it('returns undefined for an empty string name', () => {
      const { result } = renderHook(() => useSearchPlaces());
      expect(result.current.getLocationByName('')).toBeUndefined();
    });

    it('returns location for "Suối Tiên" (last preset)', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationByName('Suối Tiên');
      expect(loc).toBeDefined();
      expect(loc?.id).toBe('15');
    });

    it('returns location for "Go! Dĩ An"', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationByName('Go! Dĩ An');
      expect(loc).toBeDefined();
      expect(loc?.id).toBe('14');
    });

    it('returns location for "Trường Đại học Bách Khoa"', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationByName('Trường Đại học Bách Khoa');
      expect(loc).toBeDefined();
      expect(loc?.id).toBe('3');
    });

    it('case-insensitive match for "SUỐI TIÊN"', () => {
      const { result } = renderHook(() => useSearchPlaces());
      const loc = result.current.getLocationByName('SUỐI TIÊN');
      expect(loc).toBeDefined();
      expect(loc?.id).toBe('15');
    });
  });

  // ---------------------------------------------------------------------------
  // Stability – multiple renders return same data
  // ---------------------------------------------------------------------------
  describe('stability', () => {
    it('returns the same locations array reference between renders', () => {
      const { result, rerender } = renderHook(() => useSearchPlaces());
      const firstLocations = result.current.locations;
      rerender({});
      expect(result.current.locations).toBe(firstLocations);
    });
  });
});
