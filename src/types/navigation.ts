import { Product } from ".";
import { StoreLocation } from "../screens/shoppinglist/AddShoppingListScreen";

export type MainTabParamList = {
  Home: undefined;
  ShoppingList: undefined;
  Add: undefined;
  Stores: undefined;
  Setting: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductDetail: {
    productId: string;
    userProductId: string;
    productName: string;
  };
  PriceRecordInformation: { recordId: string };
  EditPriceRecord: { recordId: string };
  EditProduct: {
    productId: string;
  };
};

export type StoreStackParamList = {
  StoreScreen: undefined;
  StoreDetail: { storeId: string };
  EditStore: { storeId: string };
};

export type ShoppingStackParamList = {
  ShoppingList: undefined;
  ShoppingListDetail: { id: string };
  AddShoppingList: {
    selectedLocation?: StoreLocation;
  };
  SupermarketMap: {
    onSelectStore?: (location: StoreLocation) => void;
  };
};

// src/types/navigation.ts
export type RootStackParamList = {
  // Root level screens for navigation container
  App: undefined;
  Auth: undefined;

  // Auth related screens
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  // App related screens
  Main: {
    screen?: string;
    params?: {
      screen: string;
      params: { needsRefresh?: boolean };
    };
  };
  AddRecordModal: {
    handleSave?: () => void;
  };
  ProductLibrary: {
    onSelectProduct?: (product: Product) => void;
    initialSearchText?: string;
  };
  AddProduct: undefined;
  EditProduct: {
    productId: string;
  };
};

export type SettingStackParamList = {
  SettingScreen: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};
