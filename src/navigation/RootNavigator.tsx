import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import MainTabNavigator from "./MainTabNavigator";
import AddRecordScreen from "../screens/products/AddRecordScreen";
import ProductLibraryScreen from "../screens/products/ProductLibraryScreen";
import { Text } from "react-native";
import { globalStyles } from "../theme/styles";
import AddProductScreen from "../screens/products/AddProductScreen";
import HeaderAddButton from "../components/HeaderAddButton";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddRecordModal"
        component={AddRecordScreen}
        options={({ navigation, route }) => ({
          presentation: "modal",
          title: "Add Record",
          headerLeft: () => (
            <Text
              style={globalStyles.headerButton}
              onPress={() => navigation.goBack()}
            >
              Cancel
            </Text>
          ),
        })}
      />
      <Stack.Screen
        name="ProductLibrary"
        component={ProductLibraryScreen}
        options={({ navigation }) => ({
          presentation: "modal",
          title: "Product Library",
          headerLeft: () => (
            <Text
              style={globalStyles.headerButton}
              onPress={() => navigation.goBack()}
            >
              Cancel
            </Text>
          ),
          headerRight: () => (
            <HeaderAddButton
              onPress={() => navigation.navigate("AddProduct")}
            />
          ),
        })}
      />
      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Add Product",
          headerLeft: () => (
            <Text
              style={globalStyles.headerButton}
              onPress={() => navigation.goBack()}
            >
              Cancel
            </Text>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
