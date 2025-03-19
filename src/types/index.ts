// User

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  location: Location;
  preferred_unit: PreferredUnit;
  preferred_currency: string;
  created_at: Date;
  updated_at: Date;
  favorites_stores: string[]; // store_ids array
}

interface Location {
  country: string;
  province: string;
  city: string;
  street_address: string;
  postcode: string;
  coordinates: Coordinates;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PreferredUnit {
  weight: string;
  volume: string;
}

// User Customized Product
export interface CustomizedProduct {
  product_id: string;
  name: string;
  category: string;
  image_url: string;
  plu_code: string;
  barcode: string;
  created_at: Date;
  updated_at: Date;
}

// User Shopping List
export interface ShoppingList {
  list_id: string;
  product_id: string;
  product_name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// User Price Record
export interface PriceRecord {
  record_id: string;
  product_id: string;
  store_id: string;
  price: number;
  unit_type: string;
  photo_url: string;
  recorded_at: Date;
}

export type ImageType = "emoji" | "image";

// Product
export interface Product {
  product_id?: string;
  name: string;
  category: string;
  imageType: ImageType;
  imageSource: string; // emoji string or image url
  plu_code: string;
  barcode: string;
}

// Store
export interface Store {
  store_id: string;
  name: string;
  logo_url: string;
  address: string;
  location: Coordinates;
  inactive: boolean;
  created_at: Date;
  updated_at: Date;
}
