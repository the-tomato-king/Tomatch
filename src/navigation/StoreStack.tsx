import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StoreScreen from "../screens/stores/StoreScreen";
import AddStoreScreen from "../screens/stores/EditStoreScreen";
import StoreDetailScreen from "../screens/stores/StoreDetailScreen";
import { StoreStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<StoreStackParamList>();

const StoreStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StoreScreen"
        component={StoreScreen}
        options={{
          headerShown: true,
          title: "Stores",
        }}
      />
      <Stack.Screen
        name="EditStore"
        component={AddStoreScreen}
        options={{
          headerShown: true,
          title: "Edit Store",
        }}
      />
      <Stack.Screen
        name="StoreDetail"
        component={StoreDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default StoreStack;
