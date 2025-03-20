export type MainTabParamList = {
  Home: undefined;
  ShoppingList: undefined;
  Add: undefined;
  Stores: undefined;
  Setting: undefined;
};

export type HomeStackParamList = {
  HomeScreen: { needsRefresh?: boolean } | undefined;
  ProductDetail: { productId: string };
};

export type ShoppingStackParamList = {
  ShoppingList: undefined;
  AddShoppingList: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  AddRecordModal: {
    handleSave?: () => void;
  };
  ProductLibrary: undefined;
};
