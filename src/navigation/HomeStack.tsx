import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../types/navigation";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import HomeScreen from "../screens/HomeScreen";
import BackButton from "../components/BackButton";
import PriceRecordInformationScreen from "../screens/PriceRecordInformationScreen";

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
    </Stack.Navigator>
  );
};

export default HomeStack;
