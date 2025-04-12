import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../types/navigation";
import ProductDetailScreen from "../screens/products/ProductDetailScreen";
import HomeScreen from "../screens/HomeScreen";
import PriceRecordInformationScreen from "../screens/products/RecordDetailScreen";
import AddRecordScreen from "../screens/products/AddRecordScreen";
import AddProductScreen from "../screens/products/AddProductScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.productName || "Product Detail",
        })}
      />
      <Stack.Screen
        name="PriceRecordInformation"
        component={PriceRecordInformationScreen}
      />
      <Stack.Screen
        name="EditPriceRecord"
        component={AddRecordScreen}
        options={{
          headerTitle: "Edit Price Record",
          headerBackTitle: "",
        }}
      />
      <Stack.Screen
        name="EditProduct"
        component={AddProductScreen}
        options={{
          headerShown: true,
          headerTitle: "Edit Product",
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
