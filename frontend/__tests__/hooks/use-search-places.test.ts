<<<<<<< HEAD
import { renderHook, act } from '@testing-library/react-native';
import { useSearchPlaces } from '../../hooks/useSearchPlaces';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const defaultRegion = {
  latitude: 10.762622,
  longitude: 106.660172,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const mockPlacesWithPosition = [
  { id: '1', title: 'Trường Đại học Bách Khoa', vicinity: 'Quận 10', position: { lat: 10.7725, lng: 106.6580 } },
  { id: '2', title: 'Nhà thờ Đức Bà', vicinity: 'Quận 1', position: { lat: 10.7797, lng: 106.6990 } },
];

const mockPlacesMixed = [
  { id: '1', title: 'Place with position', vicinity: 'Quận 1', position: { lat: 10.77, lng: 106.69 } },
  { id: '2', title: 'Place without position', vicinity: 'Quận 2' },  // no position
  { id: '3', title: 'Another with position', vicinity: 'Quận 3', position: { lat: 10.78, lng: 106.70 } },
];

const mockApiResponse = { items: mockPlacesWithPosition };
const mockMixedApiResponse = { items: mockPlacesMixed };

describe('useSearchPlaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns empty searchResults initially', () => {
      const { result } = renderHook(() => useSearchPlaces(defaultRegion));
      expect(result.current.searchResults).toEqual([]);
    });

    it('exposes searchPlaces function', () => {
      const { result } = renderHook(() => useSearchPlaces(defaultRegion));
      expect(typeof result.current.searchPlaces).toBe('function');
    });

    it('exposes setSearchResults function', () => {
      const { result } = renderHook(() => useSearchPlaces(defaultRegion));
      expect(typeof result.current.setSearchResults).toBe('function');
    });
  });

  describe('searchPlaces - query too short', () => {
    it('clears results and does not fetch when query is empty string', async () => {
      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      // Pre-populate results
      await act(async () => {
        result.current.setSearchResults(mockPlacesWithPosition);
      });

      await act(async () => {
        await result.current.searchPlaces('');
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.searchResults).toEqual([]);
    });

    it('clears results and does not fetch when query is 1 character', async () => {
      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('a');
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.searchResults).toEqual([]);
    });

    it('clears results and does not fetch when query is 2 characters', async () => {
      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        result.current.setSearchResults(mockPlacesWithPosition);
      });

      await act(async () => {
        await result.current.searchPlaces('ab');
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.searchResults).toEqual([]);
    });

    it('does fetch when query has exactly 3 characters', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('abc');
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchPlaces - success path', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });
    });

    it('calls fetch with the correct HERE autosuggest URL', async () => {
      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('Bách Khoa');
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('https://autosuggest.search.hereapi.com/v1/autosuggest');
      expect(calledUrl).toContain(`at=${defaultRegion.latitude},${defaultRegion.longitude}`);
      expect(calledUrl).toContain('limit=5');
      expect(calledUrl).toContain('lang=vi');
      expect(calledUrl).toContain(encodeURIComponent('Bách Khoa'));
    });

    it('sets searchResults with items that have a position', async () => {
      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('Bach Khoa');
      });

      expect(result.current.searchResults).toEqual(mockPlacesWithPosition);
    });

    it('filters out items without position', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockMixedApiResponse),
      });

      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('some query');
      });

      // Should only include items with position
      expect(result.current.searchResults).toHaveLength(2);
      expect(result.current.searchResults[0].title).toBe('Place with position');
      expect(result.current.searchResults[1].title).toBe('Another with position');
    });

    it('returns all items when all have position', async () => {
      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('test search');
      });

      expect(result.current.searchResults).toHaveLength(mockPlacesWithPosition.length);
    });

    it('uses region coordinates in the URL', async () => {
      const customRegion = { latitude: 21.028511, longitude: 105.804817, latitudeDelta: 0.05, longitudeDelta: 0.05 };
      const { result } = renderHook(() => useSearchPlaces(customRegion));

      await act(async () => {
        await result.current.searchPlaces('Hoan Kiem');
      });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain(`at=${customRegion.latitude},${customRegion.longitude}`);
    });

    it('handles search results that are all filtered out (none have position)', async () => {
      const noPositionItems = [
        { id: '1', title: 'Place A', vicinity: 'Quận 1' },
        { id: '2', title: 'Place B', vicinity: 'Quận 2' },
      ];
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ items: noPositionItems }),
      });

      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('test query');
      });

      expect(result.current.searchResults).toEqual([]);
    });
  });

  describe('searchPlaces - error handling', () => {
    it('sets searchResults to empty array on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      // Pre-populate results
      await act(async () => {
        result.current.setSearchResults(mockPlacesWithPosition);
      });

      await act(async () => {
        await result.current.searchPlaces('some query');
      });

      expect(result.current.searchResults).toEqual([]);
    });

    it('sets searchResults to empty array when json() rejects', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      });

      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('some query');
      });

      expect(result.current.searchResults).toEqual([]);
    });

    it('clears previously loaded results on fetch error', async () => {
      // First call succeeds
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('Bach Khoa');
      });

      expect(result.current.searchResults.length).toBeGreaterThan(0);

      // Second call fails
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await act(async () => {
        await result.current.searchPlaces('another query');
      });

      expect(result.current.searchResults).toEqual([]);
    });
  });

  describe('setSearchResults', () => {
    it('allows manual update of searchResults', async () => {
      const { result } = renderHook(() => useSearchPlaces(defaultRegion));
      const customResults = [{ id: 'custom', title: 'Custom Place', vicinity: 'Custom', position: { lat: 10, lng: 106 } }];

      await act(async () => {
        result.current.setSearchResults(customResults);
      });

      expect(result.current.searchResults).toEqual(customResults);
    });

    it('allows clearing searchResults manually', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('Bach Khoa');
      });

      expect(result.current.searchResults.length).toBeGreaterThan(0);

      await act(async () => {
        result.current.setSearchResults([]);
      });

      expect(result.current.searchResults).toEqual([]);
    });
  });

  describe('query encoding', () => {
    it('URL-encodes queries with special characters', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('Hồ Chí Minh');
      });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain(encodeURIComponent('Hồ Chí Minh'));
    });

    it('URL-encodes queries with spaces', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      const { result } = renderHook(() => useSearchPlaces(defaultRegion));

      await act(async () => {
        await result.current.searchPlaces('Da Lat');
      });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain(encodeURIComponent('Da Lat'));
    });
  });
});
=======
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
>>>>>>> d4c01fa8adf7a584a99259b4f5b57cc8f9dacc52
