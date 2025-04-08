// src/navigation/RootNavigator.tsx
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
import BackButton from "../components/BackButton";
import LoginScreen from "../screens/auth/LoginScreen";
import { useAuth } from "../contexts/AuthContext";

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="AddRecordModal"
        component={AddRecordScreen}
        options={({ navigation }) => ({
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
      <AppStack.Screen
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
      <AppStack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={({ navigation }) => ({
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
      <AppStack.Screen
        name="EditProduct"
        component={AddProductScreen}
        options={{
          headerTitle: "Edit Product",
          headerLeft: () => <BackButton />,
        }}
      />
    </AppStack.Navigator>
  );
};

const RootNavigator = () => {
  const { user, isLoading } = useAuth();
  
  // Show loading screen while checking authentication status
  if (isLoading) {
    return null; // Or a custom loading component
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
