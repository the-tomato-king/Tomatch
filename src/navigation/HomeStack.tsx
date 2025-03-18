import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../types/navigation";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen} 
        options={{
          // title: "All Products",
        }}
      />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: true }}/>
    </Stack.Navigator>
  );
};

export default HomeStack;
