import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../types/navigation";
import { View, StyleSheet, Platform } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import StoreScreen from "../screens/StoreScreen";
import SettingScreen from "../screens/SettingScreen";
import { ButtomAddButton } from "../components/ButtomAddButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
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
        component={HomeScreen}
        options={{
          title: "All Products",
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
        component={HomeScreen}
        options={{
          tabBarButton: (props) => (
            <ButtomAddButton
              onPress={() => {
                console.log("Add button pressed");
              }}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
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
