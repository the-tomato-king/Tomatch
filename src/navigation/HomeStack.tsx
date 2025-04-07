import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../types/navigation";
import ProductDetailScreen from "../screens/products/ProductDetailScreen";
import HomeScreen from "../screens/HomeScreen";
import BackButton from "../components/BackButton";
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
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          headerShown: true,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="PriceRecordInformation"
        component={PriceRecordInformationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditPriceRecord"
        component={AddRecordScreen}
        options={{
          headerShown: true,
          headerTitle: "Edit Price Record",
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="EditProduct"
        component={AddProductScreen}
        options={{
          headerShown: true,
          headerTitle: "Edit Product",
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
