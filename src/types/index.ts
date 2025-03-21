// User

export interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  location: Location;
  preferred_unit: PreferredUnit;
  preferred_currency: string;
  favorites_stores: string[]; // store_ids array
  created_at: Date;
  updated_at: Date;
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

// User Products
export interface UserProduct {
  id: string;
  product_id: string; // reference to products collection
  created_at: Date;
  updated_at: Date;
}

// User Customized Product
export interface CustomizedProduct {
  id: string;
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
  id: string;
  product_id: string;
  product_name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// User Price Record
export interface PriceRecord {
  id: string;
  user_product_id: string; // references user_products
  store_id: string; // references stores
  price: number;
  unit_type: string;
  unit_price: number;
  photo_url: string;
  recorded_at: Date;
}

// Product Stats
export interface UserProductStats {
  id: string;
  product_id: string; // reference to products collection
  currency: string;
  total_price: number;
  average_price: number;
  lowest_price: number;
  highest_price: number;
  lowest_price_store: {
    store_id: string;
    store_name: string;
  };
  total_price_records: number;
  last_updated: Date;
}

type ImageType = "emoji" | "image";

// Product
export interface Product {
  id: string;
  name: string;
  category: string;
  image_type: ImageType;
  image_source: string; // emoji string or image url
  plu_code: string;
  barcode: string;
}

// Store
export interface Store {
  id: string;
  name: string;
  logo_url: string;
  address: string;
  location: Coordinates;
  inactive: boolean;
  created_at: Date;
  updated_at: Date;
}

