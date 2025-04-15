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
import HeaderAddButton from "../components/buttons/HeaderAddButton";
import LoginScreen from "../screens/auth/LoginScreen";
import { useAuth } from "../contexts/AuthContext";
import SignupScreen from "../screens/auth/SignupScreen";
import LoadingLogo from "../components/loading/LoadingLogo";
import OnboardingScreen from "../screens/auth/OnBoardingScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import AIDemoScreen from "../screens/auth/AIDemoScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { hasCompletedOnboarding } = useAuth();

  return (
    <AuthStack.Navigator
      initialRouteName={hasCompletedOnboarding ? "Login" : "Onboarding"}
    >
      <AuthStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: "" }}
      />
      <AuthStack.Screen
        name="AIDemo"
        component={AIDemoScreen}
        options={{ title: "AI Demo" }}
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
        options={() => ({
          presentation: "modal",
          title: "Add Record",
        })}
      />
      <AppStack.Screen
        name="ProductLibrary"
        component={ProductLibraryScreen}
        options={({ navigation }) => ({
          presentation: "modal",
          title: "Product Library",
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
        })}
      />
      <AppStack.Screen
        name="EditProduct"
        component={AddProductScreen}
        options={{
          headerTitle: "Edit Product",
        }}
      />
    </AppStack.Navigator>
  );
};

const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingLogo />;
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
