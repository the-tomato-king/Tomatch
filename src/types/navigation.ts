import { Product } from ".";

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
  };
  PriceRecordInformation: { recordId: string };
  EditPriceRecord: { recordId: string };
};

export type StoreStackParamList = {
  StoreScreen: undefined;
  AddStore: undefined;
  StoreDetail: { storeId: string };
};

export type ShoppingStackParamList = {
  ShoppingList: undefined;
  AddShoppingList: undefined;
  ShoppingListDetail: { id: string };
};

export type RootStackParamList = {
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
};

export type SettingStackParamList = {
  SettingScreen: undefined;
  EditProfile: undefined;
};
