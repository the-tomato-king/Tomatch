import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainTabNavigator from "./MainTabNavigator";
import HomeStackNavigator from "./HomeStack";

const Navigation = () => {
  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
};

export default Navigation;
