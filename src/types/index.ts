// User

// for compatibility with firebase auth user, define our own User type
export interface AppUser {
  uid: string;
  email: string;
  name?: string;
  preferred_unit?: string;
  preferred_currency?: string;
  location?: UserLocation;
}


export interface BaseUser {
  name: string;
  email: string;
  phone_number: string;
  location: UserLocation;
  preferred_unit: string;
  preferred_currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface User extends BaseUser {
  id: string;
}

export interface UserLocation {
  country: string;
  province: string;
  city: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

// User Store (sub-collection of User)
export interface BaseUserStore {
  brand_id: string; // references brands collection
  name: string; // e.g., "Walmart Downtown", "Walmart West Side"
  address: string;
  location: Coordinates;
  is_favorite: boolean;
  last_visited: Date;
  created_at: Date;
  updated_at: Date;
  is_inactive: boolean;
}

export interface UserStore extends BaseUserStore {
  id: string;
}

// User Products (sub-collection of User)
export interface BaseUserProduct {
  product_id?: string; // if it's a preset product, it references the product in the product library
  name: string; // product name (copied from the product library or user-defined)
  category: string; // product category
  image_type: ImageType; // image type
  image_source: string; // image source
  plu_code: string; // PLU code
  barcode: string; // barcode
  created_at: Date;
  updated_at: Date;
  total_price: number;
  average_price: number;
  lowest_price: number;
  highest_price: number;
  lowest_price_store: {
    store_id: string;
    store_name: string;
  };
  total_price_records: number;
}

export interface UserProduct extends BaseUserProduct {
  id: string;
}

// User Shopping List (sub-collection of User)
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

// User Price Record (sub-collection of User)
export interface BasePriceRecord {
  user_product_id: string; // references user_products
  store_id: string; // references stores
  price: number;
  currency: string;
  unit_type: string;
  unit_price: number;
  photo_url: string;
  recorded_at: Date;
}

export interface PriceRecord extends BasePriceRecord {
  id: string;
  store?: UserStore;
}
export type ImageType = "emoji" | "preset_image" | "user_image";

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

export interface BaseStoreBrand {
  name: string;
  logo: string;
  updated_at: Date;
}

export interface StoreBrand extends BaseStoreBrand {
  id: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}


