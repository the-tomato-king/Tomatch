// User

export interface BaseUser {
  name: string;
  email: string;
  phone_number: string;
  location: Location;
  preferred_unit: PreferredUnit;
  preferred_currency: string;
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

// User Store (sub-collection of User)
export interface BaseUserStore {
  brand_id: string; // references brands collection
  name: string; // e.g., "Walmart Downtown", "Walmart West Side"
  logo_url: string;
  address: string;
  location: Coordinates;
  is_favorite: boolean;
  last_visited: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserStore extends BaseUserStore {
  id: string;
}

// User Products (sub-collection of User)
export interface BaseUserProduct {
  product_id: string; // reference to products collection
  created_at: Date;
  updated_at: Date;
}

export interface UserProduct extends BaseUserProduct {
  id: string;
}

// TODO: implement it in development
// User Customized Product (sub-collection of User)
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

// TODO: implement it in development
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
  unit_type: string;
  unit_price: number;
  photo_url: string;
  recorded_at: Date;
}

export interface PriceRecord extends BasePriceRecord {
  id: string;
}

// User Product Stats(sub-collection of User)
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

export interface BaseBrand {
  name: string;
  logo_url: string;
  updated_at: Date;
}

export interface Brand extends BaseBrand {
  id: string;
}