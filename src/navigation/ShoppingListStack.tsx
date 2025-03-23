import { ShoppingStackParamList } from "../types/navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ShoppingListScreen from "../screens/shoppinglist/ShoppingListScreen";
import AddShoppingListScreen from "../screens/shoppinglist/AddShoppingListScreen";
import ShoppingListDetailScreen from "../screens/shoppinglist/ShoppingListDetailScreen";
import { Button } from "react-native";
import BackButton from "../components/BackButton";
const Stack = createNativeStackNavigator<ShoppingStackParamList>();

const ShoppingListStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "My Shopping Lists",
          headerRight: () => (
            <Button
              title="Add"
              onPress={() => navigation.navigate("AddShoppingList")}
            />
          ),
        })}
      />
      <Stack.Screen
        name="AddShoppingList"
        component={AddShoppingListScreen}
        options={{
          headerShown: true,
          title: "New List",
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="ShoppingListDetail"
        component={ShoppingListDetailScreen}
        options={{
          headerShown: true,
          title: "",
        }}
      />
    </Stack.Navigator>
  );
};

export default ShoppingListStack;
