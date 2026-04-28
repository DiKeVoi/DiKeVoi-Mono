import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  Keyboard 
} from 'react-native';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import { decode } from '@here/flexpolyline';
import { PersonStanding, HeartHandshake } from 'lucide-react-native';
const HERE_API_KEY = process.env.EXPO_PUBLIC_HERE_API_KEY;

export default function App() {
  const [region, setRegion] = useState({
    latitude: 10.8759, // VNU Location
    longitude: 106.8073,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [pickup, setPickup] = useState({ address: '', coords: null });
  const [destination, setDestination] = useState({ address: '', coords: null });
  const [searchResults, setSearchResults] = useState([]);
  const [activeInput, setActiveInput] = useState(null); // 'pickup' hoặc 'destination'
  const [routePolyline, setRoutePolyline] = useState([]);

  // Query location
  const searchPlaces = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    const url = `https://autosuggest.search.hereapi.com/v1/autosuggest?at=${region.latitude},${region.longitude}&limit=5&q=${encodeURIComponent(query)}&apiKey=${HERE_API_KEY}&lang=vi`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      // Filter location
      setSearchResults(data.items.filter(item => item.position));
    } catch (error) {
      console.error("Lỗi gọi HERE API:", error);
    }
  };

  const handleSelectPlace = (item) => {
    const newCoords = {
      latitude: item.position.lat,
      longitude: item.position.lng,
    };

    if (activeInput === 'pickup') {
      setPickup({ address: item.title, coords: newCoords });
    } else {
      setDestination({ address: item.title, coords: newCoords });
    }

    // Move to picked location
    setRegion({
      ...region,
      ...newCoords,
    });

    setSearchResults([]);
    setActiveInput(null);
    Keyboard.dismiss();
  };

  React.useEffect(() => {
    if (pickup.coords && destination.coords) {
      getRouting(pickup.coords, destination.coords);
    } else {
      setRoutePolyline([]);
    }
  }, [pickup.coords, destination.coords]);

  const getRouting = async (startCoords, endCoords) => {
  // startCoords, endCoords: { latitude, longitude }
    const transportMode = 'scooter';
    
    const url = `https://router.hereapi.com/v8/routes?transportMode=${transportMode}&origin=${startCoords.latitude},${startCoords.longitude}&destination=${endCoords.latitude},${endCoords.longitude}&return=polyline,summary&apiKey=${HERE_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const section = data.routes[0].sections[0];
        
        
        const distanceKm = (section.summary.length / 1000).toFixed(2); // Đổi sang km
        const durationMin = Math.round(section.summary.duration / 60); // Đổi sang phút
        
        console.log(`Quãng đường: ${distanceKm} km, Thời gian: ${durationMin} phút`);

        const decoded = decode(section.polyline);
        const coordinates = decoded.polyline.map(
          ([lat, lng, _elev]) => ({ latitude: lat, longitude: lng })
        );
        setRoutePolyline(coordinates);
        console.log(`Quãng đường: ${distanceKm} km, Thời gian: ${durationMin} phút`);
      }
    } catch (error) {
      console.error("Lỗi tính toán đường đi:", error);
    }
};
  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView style={styles.map} region={region}>
        <UrlTile
          urlTemplate={`https://maps.hereapi.com/v3/base/mc/{z}/{x}/{y}/png8?apiKey=${HERE_API_KEY}&style=explore.day`}
          shouldReplaceMapContent={true}
        />

        {pickup.coords && (
          <Marker 
          coordinate={pickup.coords} 
          title="Điểm đón">
            <View style={{
              backgroundColor: '#032650',
              padding: 5,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: 'white'
            }}>
              <PersonStanding size={24} color="white" />
            </View>
          </Marker>
        )}
        {destination.coords && (
          <Marker 
          coordinate={destination.coords} 
          title="Điểm đến" >
            <View style={{
              backgroundColor: '#fdfd26', 
              padding: 5,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: 'white'
            }}>
              <HeartHandshake size={24} color="white" />
            </View>
          </Marker>

        )}
        {routePolyline.length > 1 && (
          <Polyline
            coordinates={routePolyline}
            strokeColor="#2c58a5"
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* Enter location */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập điểm đón..."
          value={activeInput === 'pickup' ? undefined : pickup.address}
          onFocus={() => setActiveInput('pickup')}
          onChangeText={searchPlaces}
        />
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          placeholder="Bạn muốn đi đâu?"
          value={activeInput === 'destination' ? undefined : destination.address}
          onFocus={() => setActiveInput('destination')}
          onChangeText={searchPlaces}
        />

        {/* Display suggestions */}
        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.resultItem} 
                onPress={() => handleSelectPlace(item)}
              >
                <Text style={styles.resultText}>{item.title}</Text>
                <Text style={styles.subText}>{item.vicinity}</Text>
              </TouchableOpacity>
            )}
            style={styles.resultsList}
          />
        )}
      </View>
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