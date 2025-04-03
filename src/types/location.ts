import { LatLng } from "react-native-maps";

export interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Store {
  id: string;
  name: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  address: string;
  latitude: number;
  longitude: number;
}

export type NearbyStore = Store;
