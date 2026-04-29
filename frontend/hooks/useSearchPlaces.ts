import { useState } from 'react';

const HERE_API_KEY = process.env.EXPO_PUBLIC_HERE_API_KEY;

export function useSearchPlaces(region: any) {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    const url = `https://autosuggest.search.hereapi.com/v1/autosuggest?at=${region.latitude},${region.longitude}&limit=5&q=${encodeURIComponent(query)}&apiKey=${HERE_API_KEY}&lang=vi`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSearchResults(data.items.filter((item: any) => item.position));
    } catch (error) {
      setSearchResults([]);
    }
  };

  return { searchResults, searchPlaces, setSearchResults };
}
