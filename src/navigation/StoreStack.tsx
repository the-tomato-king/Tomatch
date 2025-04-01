import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StoreScreen from "../screens/stores/StoreScreen";
import AddStoreScreen from "../screens/stores/AddStoreScreen";
import StoreDetailScreen from "../screens/stores/StoreDetailScreen";
import { StoreStackParamList } from "../types/navigation";
import BackButton from "../components/BackButton";
import HeaderAddButton from "../components/HeaderAddButton";

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
            <HeaderAddButton onPress={() => navigation.navigate("AddStore")} />
          ),
        })}
      />
      <Stack.Screen
        name="AddStore"
        component={AddStoreScreen}
        options={{
          headerShown: true,
          title: "Add New Store",
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
    </Stack.Navigator>
  );
};

export default StoreStack;
