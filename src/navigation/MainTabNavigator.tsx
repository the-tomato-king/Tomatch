import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList, RootStackParamList } from "../types/navigation";
import { View, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import HomeStack from "./HomeStack";
import StoreStack from "./StoreStack";
import SettingStack from "./SettingStack";
import { ButtomAddButton } from "../components/ButtomAddButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ShoppingListStack from "./ShoppingListStack";

const Tab = createBottomTabNavigator<MainTabParamList>();
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MainTabNavigator = () => {
  const navigation = useNavigation<RootNavigationProp>();

  const BlankScreen = () => {
    return <View />;
  };
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#1A73E8",
        tabBarInactiveTintColor: "#5F6368",
        tabBarStyle: {
          height: Platform.OS === "ios" ? 80 : 60,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          paddingTop: 10,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stores"
        component={StoreStack}
        options={{
          headerShown: false,
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
        component={BlankScreen}
        options={{
          tabBarButton: (props) => (
            <ButtomAddButton
              onPress={() => {
                navigation.navigate("AddRecordModal", {
                  handleSave: () => {
                    navigation.navigate("Main", {
                      params: {
                        screen: "Home",
                        params: {
                          needsRefresh: true,
                        },
                      },
                    });
                  },
                });
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
        component={SettingStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
