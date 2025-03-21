// User

export interface BaseUser {
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

export interface User extends BaseUser {
  id: string;
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
export interface BaseUserProduct {
  product_id: string; // reference to products collection
  created_at: Date;
  updated_at: Date;
}

export interface UserProduct extends BaseUserProduct {
  id: string;
}

// User Customized Product
export interface BaseCustomizedProduct {
  name: string;
  category: string;
  image_url: string;
  plu_code: string;
  barcode: string;
  created_at: Date;
  updated_at: Date;
}

export interface CustomizedProduct extends BaseCustomizedProduct {
  id: string;
}

// User Shopping List
export interface BaseShoppingList {
  product_id: string;
  product_name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface ShoppingList extends BaseShoppingList {
  id: string;
}

// User Price Record
export interface BasePriceRecord {
  user_product_id: string; // references user_products
  store_id: string; // references stores
  price: number;
  unit_type: string;
  unit_price: number;
  photo_url: string;
  recorded_at: Date;
}

export interface PriceRecord extends BasePriceRecord {
  id: string;
}

// Product Stats
export interface BaseUserProductStats {
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

export interface UserProductStats extends BaseUserProductStats {
  id: string;
}

type ImageType = "emoji" | "image";

// Product
export interface BaseProduct {
  name: string;
  category: string;
  image_type: ImageType;
  image_source: string; // emoji string or image url
  plu_code: string;
  barcode: string;
}

export interface Product extends BaseProduct {
  id: string;
}

// Store
export interface BaseStore {
  name: string;
  logo_url: string;
  address: string;
  location: Coordinates;
  inactive: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Store extends BaseStore {
  id: string;
}
