import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList, RootStackParamList } from "../types/navigation";
import { View, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import HomeStack from "./HomeStack";
import StoreScreen from "../screens/StoreScreen";
import SettingScreen from "../screens/SettingScreen";
import { ButtomAddButton } from "../components/ButtomAddButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ShoppingListStack from "./ShoppingListStack";

const Tab = createBottomTabNavigator<MainTabParamList>();
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MainTabNavigator = () => {
  const navigation = useNavigation<RootNavigationProp>();

  const blankScreen = () => {
    return <View />;
  };
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#1A73E8",
        tabBarInactiveTintColor: "#5F6368",
        tabBarStyle: {
          height: Platform.OS === "ios" ? 75 : 60, // iOS device need more height to avoid button hidden
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: "All Products",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stores"
        component={StoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="storefront"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={blankScreen}
        options={{
          tabBarButton: (props) => (
            <ButtomAddButton
              onPress={() => {
                navigation.navigate("AddRecordModal");
              }}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="ShoppingList"
        component={ShoppingListStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
