import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Keyboard } from 'react-native';
import MapSection from '../../components/request/MapSection';
import SearchSection from '../../components/request/SearchSection';
import { useSearchPlaces } from '../../hooks/useSearchPlaces';
import { useRouting } from '../../hooks/useRouting';
const HERE_API_KEY = process.env.EXPO_PUBLIC_HERE_API_KEY;

export default function Request() {
  const [region, setRegion] = useState({
    latitude: 10.8759,
    longitude: 106.8073,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [pickup, setPickup] = useState({ address: '', coords: null });
  const [destination, setDestination] = useState({ address: '', coords: null });
  const [activeInput, setActiveInput] = useState<string | null>(null);

  // Hooks
  const { searchResults, searchPlaces, setSearchResults } = useSearchPlaces(region);
  const { routePolyline, distanceKm, durationMin, getRouting, setRoutePolyline } = useRouting();

  // Handle select place
  const handleSelectPlace = (item: any) => {
    const newCoords = {
      latitude: item.position.lat,
      longitude: item.position.lng,
    };
    if (activeInput === 'pickup') {
      setPickup({ address: item.title, coords: newCoords });
    } else {
      setDestination({ address: item.title, coords: newCoords });
    }

    setRegion({ ...region, ...newCoords });
    setSearchResults([]);
    setActiveInput(null);
    Keyboard.dismiss();
  };

  const handleSubmitLocation = () => {
    console.log(`Quãng đường: ${distanceKm} km, Thời gian: ${durationMin} phút`);
    alert("Chọn địa điểm thành công!")
  }

  useEffect(() => {
    if (pickup.coords && destination.coords) {
      getRouting(pickup.coords, destination.coords);
    } else {
      setRoutePolyline([]);
    }
  }, [pickup.coords, destination.coords]);

  return (
    <View style={styles.container}>
      <MapSection
        region={region}
        pickup={pickup}
        destination={destination}
        routePolyline={routePolyline}
        HERE_API_KEY={HERE_API_KEY?? ""}
      />
      <SearchSection
        pickup={pickup}
        destination={destination}
        activeInput={activeInput}
        setActiveInput={setActiveInput}
        searchPlaces={searchPlaces}
        searchResults={searchResults}
        handleSelectPlace={handleSelectPlace}
        styles={styles}
        onConfirm={handleSubmitLocation}
        confirmDisabled={!pickup.coords || !destination.coords}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  resultsList: {
    backgroundColor: 'white',
    marginTop: 5,
    borderRadius: 8,
    maxHeight: 200,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  resultText: { fontWeight: 'bold' },
  subText: { fontSize: 12, color: 'gray' },
});