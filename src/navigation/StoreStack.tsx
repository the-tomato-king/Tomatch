import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StoreScreen from "../screens/StoreScreen";
import AddStoreScreen from "../screens/AddStoreScreen";
import { Button } from "react-native";
import { StoreStackParamList } from "../types/navigation";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator<StoreStackParamList>();

const StoreStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StoreScreen"
        component={StoreScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Stores",
          headerRight: () => (
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color="black"
              onPress={() => navigation.navigate("AddStore")}
            />
          ),
        })}
      />
      <Stack.Screen
        name="AddStore"
        component={AddStoreScreen}
        options={{
          headerShown: true,
          title: "Add New Store",
        }}
      />
    </Stack.Navigator>
  );
};

export default StoreStack;
