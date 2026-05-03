import React from 'react';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import { View } from 'react-native';
import { PersonStanding, HeartHandshake } from 'lucide-react-native';

interface MapSectionProps {
  region: any;
  pickup: any;
  destination: any;
  routePolyline: any[];
  HERE_API_KEY: string;
}

export default function MapSection({ region, pickup, destination, routePolyline, HERE_API_KEY }: MapSectionProps) {
  return (
    <MapView style={{ flex: 1 }} region={region}>
      <UrlTile
        urlTemplate={`https://maps.hereapi.com/v3/base/mc/{z}/{x}/{y}/png8?apiKey=${HERE_API_KEY}&style=explore.day`}
        shouldReplaceMapContent={true}
      />
      {pickup.coords && (
        <Marker coordinate={pickup.coords} title="Điểm đón">
          <View style={{ backgroundColor: '#152249', padding: 5, borderRadius: 20, borderWidth: 2, borderColor: 'white' }}>
            <PersonStanding size={24} color="white" />
          </View>
        </Marker>
      )}
      {destination.coords && (
        <Marker coordinate={destination.coords} title="Điểm đến">
          <View style={{ backgroundColor: '#F9F871', padding: 5, borderRadius: 20, borderWidth: 2, borderColor: 'white' }}>
            <HeartHandshake size={24} color="white" />
          </View>
        </Marker>
      )}
      {routePolyline.length > 1 && (
        <Polyline coordinates={routePolyline} strokeColor="#152249" strokeWidth={5} />
      )}
    </MapView>
  );
}
