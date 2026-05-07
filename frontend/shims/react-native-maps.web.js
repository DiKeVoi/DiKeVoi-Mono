import React from "react";
import { View } from "react-native";

const Stub = ({ children }) => React.createElement(View, null, children ?? null);
Stub.Animated = Stub;

export default Stub;
export const MapView = Stub;
export const Animated = Stub;
export const Marker = Stub;
export const MapMarker = Stub;
export const MarkerAnimated = Stub;
export const Overlay = Stub;
export const MapOverlay = Stub;
export const OverlayAnimated = Stub;
export const Polyline = Stub;
export const MapPolyline = Stub;
export const Heatmap = Stub;
export const MapHeatmap = Stub;
export const Polygon = Stub;
export const MapPolygon = Stub;
export const Circle = Stub;
export const MapCircle = Stub;
export const UrlTile = Stub;
export const MapUrlTile = Stub;
export const WMSTile = Stub;
export const MapWMSTile = Stub;
export const LocalTile = Stub;
export const MapLocalTile = Stub;
export const Callout = Stub;
export const MapCallout = Stub;
export const CalloutSubview = Stub;
export const MapCalloutSubview = Stub;
export const Geojson = Stub;
export const AnimatedRegion = class {
  constructor(v) { Object.assign(this, v); }
  setValue() {}
  timing() { return { start() {} }; }
};
export const MAP_TYPES = {
  STANDARD: "standard",
  SATELLITE: "satellite",
  HYBRID: "hybrid",
  TERRAIN: "terrain",
  NONE: "none",
  MUTEDSTANDARD: "mutedStandard",
};
export const PROVIDER_DEFAULT = undefined;
export const PROVIDER_GOOGLE = "google";
