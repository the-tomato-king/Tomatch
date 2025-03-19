import { ShoppingStackParamList } from "../types/navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import AddShoppingListScreen from "../screens/AddShoppingListScreen";
import { Button } from "react-native";

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
        }}
      />
    </Stack.Navigator>
  );
};

export default ShoppingListStack;