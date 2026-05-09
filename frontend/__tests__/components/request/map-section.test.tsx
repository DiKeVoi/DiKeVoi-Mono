import React from 'react';
import { render } from '@testing-library/react-native';
import MapSection from '../../../components/request/MapSection';

const defaultRegion = {
  latitude: 10.762622,
  longitude: 106.660172,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const mockPickupWithCoords = {
  coords: { latitude: 10.762622, longitude: 106.660172 },
  address: 'Điểm đón test',
};

const mockPickupNoCoords = {
  coords: null,
  address: '',
};

const mockDestinationWithCoords = {
  coords: { latitude: 10.772622, longitude: 106.670172 },
  address: 'Điểm đến test',
};

const mockDestinationNoCoords = {
  coords: null,
  address: '',
};

const mockPolyline = [
  { latitude: 10.762622, longitude: 106.660172 },
  { latitude: 10.772622, longitude: 106.670172 },
  { latitude: 10.782622, longitude: 106.680172 },
];

const HERE_API_KEY = 'test-api-key-12345';

describe('MapSection', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupNoCoords}
        destination={mockDestinationNoCoords}
        routePolyline={[]}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders MapView with the correct region', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupNoCoords}
        destination={mockDestinationNoCoords}
        routePolyline={[]}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    expect(json.type).toBe('MapView');
    expect(json.props.region).toEqual(defaultRegion);
  });

  it('renders UrlTile with HERE API key in URL template', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupNoCoords}
        destination={mockDestinationNoCoords}
        routePolyline={[]}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    const urlTile = json.children[0];
    expect(urlTile.type).toBe('UrlTile');
    expect(urlTile.props.urlTemplate).toContain(HERE_API_KEY);
    expect(urlTile.props.shouldReplaceMapContent).toBe(true);
  });

  it('renders pickup Marker when pickup has coords', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupWithCoords}
        destination={mockDestinationNoCoords}
        routePolyline={[]}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    const children = json.children;
    const marker = children.find((child: any) => child && child.type === 'Marker');
    expect(marker).toBeTruthy();
    expect(marker.props.coordinate).toEqual(mockPickupWithCoords.coords);
    expect(marker.props.title).toBe('Điểm đón');
  });

  it('does not render pickup Marker when pickup has no coords', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupNoCoords}
        destination={mockDestinationNoCoords}
        routePolyline={[]}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    const children = (json.children || []).filter(Boolean);
    // Only UrlTile should be present, no Markers
    const markers = children.filter((child: any) => child && child.type === 'Marker');
    expect(markers).toHaveLength(0);
  });

  it('renders destination Marker when destination has coords', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupNoCoords}
        destination={mockDestinationWithCoords}
        routePolyline={[]}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    const children = json.children;
    const marker = children.find((child: any) => child && child.type === 'Marker');
    expect(marker).toBeTruthy();
    expect(marker.props.coordinate).toEqual(mockDestinationWithCoords.coords);
    expect(marker.props.title).toBe('Điểm đến');
  });

  it('does not render destination Marker when destination has no coords', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupNoCoords}
        destination={mockDestinationNoCoords}
        routePolyline={[]}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    const children = (json.children || []).filter(Boolean);
    const markers = children.filter((child: any) => child && child.type === 'Marker');
    expect(markers).toHaveLength(0);
  });

  it('renders both pickup and destination Markers when both have coords', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupWithCoords}
        destination={mockDestinationWithCoords}
        routePolyline={[]}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    const children = (json.children || []).filter(Boolean);
    const markers = children.filter((child: any) => child && child.type === 'Marker');
    expect(markers).toHaveLength(2);
  });

  it('renders Polyline when routePolyline has more than 1 point', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupNoCoords}
        destination={mockDestinationNoCoords}
        routePolyline={mockPolyline}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    const children = (json.children || []).filter(Boolean);
    const polyline = children.find((child: any) => child && child.type === 'Polyline');
    expect(polyline).toBeTruthy();
    expect(polyline.props.coordinates).toEqual(mockPolyline);
    expect(polyline.props.strokeColor).toBe('#152249');
    expect(polyline.props.strokeWidth).toBe(5);
  });

  it('does not render Polyline when routePolyline is empty', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupNoCoords}
        destination={mockDestinationNoCoords}
        routePolyline={[]}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    const children = (json.children || []).filter(Boolean);
    const polyline = children.find((child: any) => child && child.type === 'Polyline');
    expect(polyline).toBeUndefined();
  });

  it('does not render Polyline when routePolyline has exactly 1 point', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupNoCoords}
        destination={mockDestinationNoCoords}
        routePolyline={[{ latitude: 10.762622, longitude: 106.660172 }]}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    const children = (json.children || []).filter(Boolean);
    const polyline = children.find((child: any) => child && child.type === 'Polyline');
    expect(polyline).toBeUndefined();
  });

  it('renders fully with all props (pickup, destination, polyline)', () => {
    const { toJSON } = render(
      <MapSection
        region={defaultRegion}
        pickup={mockPickupWithCoords}
        destination={mockDestinationWithCoords}
        routePolyline={mockPolyline}
        HERE_API_KEY={HERE_API_KEY}
      />
    );
    const json = toJSON() as any;
    const children = (json.children || []).filter(Boolean);
    const markers = children.filter((child: any) => child && child.type === 'Marker');
    const polyline = children.find((child: any) => child && child.type === 'Polyline');
    expect(markers).toHaveLength(2);
    expect(polyline).toBeTruthy();
  });
});
