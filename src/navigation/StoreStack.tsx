import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StoreScreen from "../screens/stores/StoreScreen";
import AddStoreScreen from "../screens/stores/EditStoreScreen";
import StoreDetailScreen from "../screens/stores/StoreDetailScreen";
import SelectStoreBrandScreen from "../screens/stores/SelectStoreBrandScreen";
import { StoreStackParamList } from "../types/navigation";
import BackButton from "../components/buttons/BackButton";
import HeaderAddButton from "../components/buttons/HeaderAddButton";

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
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="StoreDetail"
        component={StoreDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SelectStoreBrand"
        component={SelectStoreBrandScreen}
        options={{
          title: "Select Store Brand",
        }}
      />
    </Stack.Navigator>
  );
};

export default StoreStack;
